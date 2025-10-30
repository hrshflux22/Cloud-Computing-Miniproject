# DynamoDB Setup Guide for Nimbus HR

## Step 1: Create Employees Table

1. Go to **AWS Console** → **DynamoDB**
2. Click **Create table**
3. Configure:
   - **Table name**: `Employees`
   - **Partition key**: `email` (String)
   - **Sort key**: Leave empty
   - **Table settings**: Default settings
   - **Table class**: Standard
   - **Capacity mode**: On-demand (recommended for AWS Academy)
4. Click **Create table**

### Optional: Add Global Secondary Index (GSI) for Department Queries

After table is created:
1. Go to table → **Indexes** tab
2. Click **Create index**
3. Configure:
   - **Partition key**: `department` (String)
   - **Index name**: `byDepartment`
   - **Projected attributes**: All
4. Click **Create index**

---

## Step 2: Create LeaveRequests Table

1. In DynamoDB, click **Create table**
2. Configure:
   - **Table name**: `LeaveRequests`
   - **Partition key**: `requestId` (String)
   - **Sort key**: Leave empty
   - **Table settings**: Default settings
   - **Capacity mode**: On-demand
3. Click **Create table**

### Add GSI for Employee Queries

After table is created:
1. Go to table → **Indexes** tab
2. Click **Create index**
3. Configure:
   - **Partition key**: `employeeEmail` (String)
   - **Sort key**: `appliedDate` (String)
   - **Index name**: `byEmployee`
   - **Projected attributes**: All
4. Click **Create index**

---

## Step 3: Update Lambda IAM Role

1. Go to **AWS Console** → **Lambda** → Your function
2. Go to **Configuration** tab → **Permissions**
3. Click on the **Role name** (opens IAM in new tab)
4. In IAM, click **Add permissions** → **Attach policies**
5. Search for and attach: `AmazonDynamoDBFullAccess` (for testing)
   - For production, use the custom policy in `aws/iam/dynamodb_policy.json`

---

## Step 4: Get Your SNS Topic ARN

1. Go to **AWS Console** → **SNS**
2. Click on **Topics**
3. Click on your topic (e.g., `EmployeeNotifications`)
4. Copy the **ARN** (looks like: `arn:aws:sns:us-east-1:123456789012:EmployeeNotifications`)
5. Save this ARN - you'll add it to the Lambda environment variables

---

## Step 5: Update Lambda Environment Variables

1. Go to **Lambda** → Your function → **Configuration** → **Environment variables**
2. Click **Edit**
3. Add these variables:
   - **Key**: `SNS_TOPIC_ARN` | **Value**: (paste your SNS topic ARN)
   - **Key**: `EMPLOYEES_TABLE` | **Value**: `Employees`
   - **Key**: `LEAVE_REQUESTS_TABLE` | **Value**: `LeaveRequests`
4. Click **Save**

---

## Step 6: Update Lambda Function Code

1. Replace the code in `handler.py` with the updated version from `aws/lambda/handler.py`
2. Make sure boto3 is available (it's included by default in Lambda Python runtime)
3. Click **Deploy**

---

## Step 7: Test the Setup

### Test 1: Create Employee
In Lambda console, use this test event:
```json
{
  "action": "createEmployee",
  "employeeEmail": "test@company.com",
  "employeeName": "Test User",
  "password": "TempPass123!",
  "position": "Software Engineer",
  "department": "IT",
  "salary": 75000
}
```

### Test 2: List Employees
```json
{
  "action": "listEmployees"
}
```

### Test 3: Create Leave Request
```json
{
  "action": "createLeave",
  "employeeEmail": "test@company.com",
  "employeeName": "Test User",
  "leaveType": "Annual Leave",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "reason": "Holiday vacation"
}
```

---

## Step 8: Rebuild and Deploy Frontend

After Lambda is working:
```powershell
npm run build
aws s3 sync build/ s3://nimbus-hr-miniproject-grp20/ --delete
```

---

## Table Schemas

### Employees Table
```
{
  "email": "john.doe@company.com",         // PK
  "name": "John Doe",
  "position": "Software Engineer",
  "department": "IT",
  "salary": 85000,
  "status": "active",
  "joinDate": "2025-10-24",
  "gender": "male",
  "maritalStatus": "single"
}
```

### LeaveRequests Table
```
{
  "requestId": "uuid-string",              // PK
  "employeeEmail": "john.doe@company.com", // GSI PK
  "employeeName": "John Doe",
  "type": "Annual Leave",
  "startDate": "2025-12-20",
  "endDate": "2025-12-25",
  "status": "pending",
  "reason": "Holiday vacation",
  "appliedDate": "2025-10-24"              // GSI SK
}
```

---

## Troubleshooting

**Error: AccessDenied for DynamoDB**
- Check Lambda IAM role has DynamoDB permissions
- Verify table names match environment variables

**Error: ResourceNotFoundException**
- Verify tables are created and names match exactly (case-sensitive)
- Check you're in the correct AWS region (us-east-1)

**CORS errors in browser**
- Verify Lambda Function URL has CORS configured
- Allow origin: `*` or your specific S3 website URL
- Allow headers: `content-type`
- Allow methods: `POST, GET, OPTIONS`

**SNS not sending emails**
- Verify SNS_TOPIC_ARN is correct in Lambda environment variables
- Check Lambda IAM role has SNS:Publish permission
- Ensure your email is subscribed and confirmed in SNS topic
