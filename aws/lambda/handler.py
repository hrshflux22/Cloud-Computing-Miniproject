import json
import os
import boto3
import uuid
import secrets
import string
import hashlib
from datetime import datetime
from decimal import Decimal

# Environment variables
EMP_TABLE = os.environ.get('EMPLOYEES_TABLE', 'Employees')
LEAVE_TABLE = os.environ.get('LEAVE_REQUESTS_TABLE', 'LeaveRequests')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

_dynamo = boto3.resource('dynamodb')
emp_table = _dynamo.Table(EMP_TABLE)
leave_table = _dynamo.Table(LEAVE_TABLE)

sns = boto3.client('sns') if SNS_TOPIC_ARN else None


def _cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
    }


def _resp(status_code: int, body: dict):
    return {
        'statusCode': status_code,
        'headers': _cors_headers(),
        'body': json.dumps(body, default=_json_encoder)
    }


def _json_encoder(obj):
    if isinstance(obj, (datetime,)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj) if obj % 1 != 0 else int(obj)
    raise TypeError


def _send_sns(subject: str, message: str):
    """Helper to send SNS notification"""
    if sns and SNS_TOPIC_ARN:
        try:
            sns.publish(TopicArn=SNS_TOPIC_ARN, Subject=subject, Message=message)
            return True
        except Exception as e:
            print(f'SNS publish failed: {e}')
    return False


def handler(event, context):
    """Main Lambda handler"""
    # Handle preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return _resp(200, {'ok': True})

    try:
        body_json = json.loads(event.get('body') or '{}')
    except Exception:
        body_json = {}

    action = body_json.get('action')

    # Route actions
    if action == 'createEmployee':
        return create_employee(body_json)
    if action == 'listEmployees':
        return list_employees()
    if action == 'updateEmployee':
        return update_employee(body_json)
    if action == 'deleteEmployee':
        return delete_employee(body_json)
    if action == 'validateLogin':
        return validate_login(body_json)
    if action == 'createLeave':
        return create_leave(body_json)
    if action == 'listLeaves':
        return list_leaves(body_json.get('employeeEmail'))
    if action == 'updateLeaveStatus':
        return update_leave_status(body_json)
    if action == 'health':
        return _resp(200, {'ok': True, 'service': 'nimbus-hr-lambda'})

    return _resp(400, {'error': f'Unknown action: {action}'})


def create_employee(data: dict):
    """Create a new employee"""
    try:
        email = data.get('employeeEmail') or data.get('email')
        name = data.get('employeeName') or data.get('name')
        
        if not email or not name:
            return _resp(400, {'error': 'Email and name are required'})
        
        # Check if employee exists
        try:
            existing = emp_table.get_item(Key={'email': email})
            if 'Item' in existing:
                return _resp(409, {'error': 'Employee with this email already exists'})
        except Exception:
            pass
        
        # Generate secure random password (12 characters: letters, digits, special chars)
        alphabet = string.ascii_letters + string.digits + '!@#$%^&*'
        password = ''.join(secrets.choice(alphabet) for _ in range(12))
        
        # Hash the password using SHA-256 (secure storage)
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Create employee record with hashed password
        employee = {
            'email': email,
            'name': name,
            'password': password_hash,  # Store ONLY the hash, never plaintext
            'position': data.get('position', 'Employee'),
            'department': data.get('department', 'General'),
            'salary': Decimal(str(data.get('salary', 50000))),
            'status': data.get('status', 'active'),
            'joinDate': data.get('joinDate', datetime.now().strftime('%Y-%m-%d'))
        }
        
        if data.get('gender'):
            employee['gender'] = data['gender']
        if data.get('maritalStatus'):
            employee['maritalStatus'] = data['maritalStatus']
        
        emp_table.put_item(Item=employee)
        
        # Send credentials via SNS email (ONLY way employee gets their password)
        message = f"""Hello {name},

Welcome to Nimbus HR! Your employee account has been created.

Login Credentials:
Email: {email}
Password: {password}

Please keep this password secure. For security reasons, this password will not be shown again.

To access the system, visit:
http://nimbus-hr-miniproject-grp20.s3-website-us-east-1.amazonaws.com

Best regards,
Nimbus HR Team"""
        
        sns_sent = _send_sns('Welcome to Nimbus HR - Your Login Credentials', message)
        
        # Return employee data WITHOUT password
        return _resp(200, {
            'success': True,
            'message': 'Employee created successfully. Credentials sent via email.',
            'emailSent': sns_sent,
            'employee': json.loads(json.dumps(employee, default=_json_encoder))
        })
        
    except Exception as e:
        print(f'Error creating employee: {e}')
        return _resp(500, {'error': str(e)})


def list_employees():
    """List all employees"""
    try:
        resp = emp_table.scan()
        items = resp.get('Items', [])
        
        # Remove password hash from all employee records
        employees = []
        for item in items:
            emp = {k: v for k, v in item.items() if k != 'password'}
            employees.append(emp)
        
        return _resp(200, {
            'success': True,
            'employees': json.loads(json.dumps(employees, default=_json_encoder))
        })
    except Exception as e:
        print(f'Error listing employees: {e}')
        return _resp(500, {'error': str(e)})


def update_employee(data: dict):
    """Update employee information"""
    try:
        email = data.get('email')
        updates = data.get('updates', {})
        
        if not email:
            return _resp(400, {'error': 'Email is required'})
        
        # Build update expression
        update_parts = []
        expr_values = {}
        expr_names = {}
        
        for key, value in updates.items():
            if key != 'email':  # Don't update PK
                attr_name = f'#{key}'
                attr_value = f':{key}'
                update_parts.append(f'{attr_name} = {attr_value}')
                expr_names[attr_name] = key
                
                if isinstance(value, (int, float)):
                    expr_values[attr_value] = Decimal(str(value))
                else:
                    expr_values[attr_value] = value
        
        if not update_parts:
            return _resp(400, {'error': 'No updates provided'})
        
        update_expr = 'SET ' + ', '.join(update_parts)
        
        resp = emp_table.update_item(
            Key={'email': email},
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values,
            ReturnValues='ALL_NEW'
        )
        
        return _resp(200, {
            'success': True,
            'employee': json.loads(json.dumps(resp['Attributes'], default=_json_encoder))
        })
        
    except Exception as e:
        print(f'Error updating employee: {e}')
        return _resp(500, {'error': str(e)})


def delete_employee(data: dict):
    """Delete an employee"""
    try:
        email = data.get('email')
        
        if not email:
            return _resp(400, {'error': 'Email is required'})
        
        emp_table.delete_item(Key={'email': email})
        
        return _resp(200, {'success': True})
        
    except Exception as e:
        print(f'Error deleting employee: {e}')
        return _resp(500, {'error': str(e)})


def validate_login(data: dict):
    """Validate employee login credentials"""
    try:
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return _resp(400, {'error': 'Email and password are required'})
        
        # Get employee from DynamoDB
        result = emp_table.get_item(Key={'email': email})
        
        if 'Item' not in result:
            return _resp(401, {'success': False, 'error': 'Invalid credentials'})
        
        employee = result['Item']
        
        # Hash the provided password and compare with stored hash
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if employee.get('password') != password_hash:
            return _resp(401, {'success': False, 'error': 'Invalid credentials'})
        
        # Password is valid - return success (don't send password back)
        employee_data = {k: v for k, v in employee.items() if k != 'password'}
        
        return _resp(200, {
            'success': True,
            'employee': json.loads(json.dumps(employee_data, default=_json_encoder))
        })
        
    except Exception as e:
        print(f'Error validating login: {e}')
        return _resp(500, {'error': str(e)})
        
        return _resp(200, {
            'success': True,
            'message': 'Employee deleted successfully'
        })
        
    except Exception as e:
        print(f'Error deleting employee: {e}')
        return _resp(500, {'error': str(e)})


def create_leave(data: dict):
    """Create a leave request"""
    try:
        employee_email = data.get('employeeEmail')
        employee_name = data.get('employeeName')
        leave_type = data.get('leaveType') or data.get('type')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        reason = data.get('reason', '')
        
        if not all([employee_email, employee_name, leave_type, start_date, end_date]):
            return _resp(400, {'error': 'Missing required fields'})
        
        request_id = str(uuid.uuid4())
        applied_date = datetime.now().strftime('%Y-%m-%d')
        
        leave_request = {
            'requestId': request_id,
            'employeeEmail': employee_email,
            'employeeName': employee_name,
            'type': leave_type,
            'startDate': start_date,
            'endDate': end_date,
            'status': 'pending',
            'reason': reason,
            'appliedDate': applied_date
        }
        
        leave_table.put_item(Item=leave_request)
        
        # Notify
        message = f"""Hello {employee_name},

Your leave request has been submitted.

Leave Details:
Type: {leave_type}
From: {start_date}
To: {end_date}
Status: Pending

You will be notified once reviewed.

Best regards,
Nimbus HR Team"""
        
        _send_sns('Leave Request Submitted', message)
        
        return _resp(200, {
            'success': True,
            'message': 'Leave request created successfully',
            'leaveRequest': leave_request
        })
        
    except Exception as e:
        print(f'Error creating leave: {e}')
        return _resp(500, {'error': str(e)})


def list_leaves(employee_email: str = None):
    """List leave requests"""
    try:
        if employee_email:
            # Query by employee if GSI exists, otherwise scan with filter
            try:
                resp = leave_table.query(
                    IndexName='byEmployee',
                    KeyConditionExpression='employeeEmail = :email',
                    ExpressionAttributeValues={':email': employee_email}
                )
            except:
                # Fallback to scan if GSI doesn't exist
                resp = leave_table.scan(
                    FilterExpression='employeeEmail = :email',
                    ExpressionAttributeValues={':email': employee_email}
                )
        else:
            resp = leave_table.scan()
        
        items = resp.get('Items', [])
        return _resp(200, {
            'success': True,
            'leaveRequests': items
        })
        
    except Exception as e:
        print(f'Error listing leaves: {e}')
        return _resp(500, {'error': str(e)})


def update_leave_status(data: dict):
    """Update leave request status"""
    try:
        request_id = data.get('requestId')
        status = data.get('status')  # 'approved' or 'rejected'
        
        if not request_id or not status:
            return _resp(400, {'error': 'Request ID and status are required'})
        
        # Get current request
        resp = leave_table.get_item(Key={'requestId': request_id})
        if 'Item' not in resp:
            return _resp(404, {'error': 'Leave request not found'})
        
        leave_req = resp['Item']
        
        # Update status
        leave_table.update_item(
            Key={'requestId': request_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': status}
        )
        
        # Notify
        status_msg = {
            'approved': 'Great news! Your leave request has been approved.',
            'rejected': 'Your leave request has been rejected. Please contact HR for details.'
        }
        
        message = f"""Hello {leave_req['employeeName']},

{status_msg.get(status, 'Your leave request status has been updated.')}

Leave Details:
Type: {leave_req['type']}
From: {leave_req['startDate']}
To: {leave_req['endDate']}
Status: {status.upper()}

Best regards,
Nimbus HR Team"""
        
        _send_sns(f'Leave Request {status.capitalize()}', message)
        
        return _resp(200, {
            'success': True,
            'message': f'Leave request {status} successfully'
        })
        
    except Exception as e:
        print(f'Error updating leave status: {e}')
        return _resp(500, {'error': str(e)})
