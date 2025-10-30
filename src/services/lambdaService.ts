// Lambda Function Service for AWS SNS Notifications and DynamoDB Operations

const LAMBDA_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL;
const DYNAMODB_LAMBDA_URL = import.meta.env.VITE_DYNAMODB_LAMBDA_URL;

interface SNSNotificationParams {
  email: string;
  subject: string;
  message: string;
  employeeName?: string;
  password?: string;
}

/**
 * Send notification via AWS Lambda + SNS
 */
export const sendSNSNotification = async (params: SNSNotificationParams) => {
  try {
    if (!LAMBDA_URL) {
      throw new Error('Lambda Function URL is not configured. Please add VITE_LAMBDA_FUNCTION_URL to your .env file');
    }

    console.log('Calling Lambda function at:', LAMBDA_URL);
    console.log('With params:', { ...params, password: '***' }); // Don't log password

    const response = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Enable CORS
      body: JSON.stringify(params)
    });

    console.log('Lambda response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lambda error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Lambda success response:', data);
    
    return {
      success: true,
      data: data,
      message: 'Notification sent successfully'
    };
  } catch (error) {
    console.error('Lambda SNS Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification'
    };
  }
};

/**
 * Create employee in DynamoDB and send credentials via SNS
 */
export const createEmployee = async (
  email: string,
  name: string,
  password: string,
  position: string,
  department: string,
  salary: number,
  gender?: string,
  maritalStatus?: string
) => {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'createEmployee',
        employeeEmail: email,
        employeeName: name,
        password: password,
        position,
        department,
        salary,
        gender,
        maritalStatus
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `HTTP error! status: ${response.status}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      employee: data.employee,
      emailSent: data.emailSent || false,
      message: 'Employee created successfully'
    };
  } catch (error) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create employee'
    };
  }
};

/**
 * Send leave request notification
 */
export const sendLeaveNotification = async (
  email: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  status: 'pending' | 'approved' | 'rejected'
) => {
  const statusMessages = {
    pending: 'Your leave request has been submitted and is pending approval.',
    approved: 'Great news! Your leave request has been approved.',
    rejected: 'Your leave request has been rejected. Please contact HR for more information.'
  };

  const message = `
Hello ${employeeName},

${statusMessages[status]}

Leave Details:
Type: ${leaveType}
From: ${startDate}
To: ${endDate}
Status: ${status.toUpperCase()}

Best regards,
Nimbus HR Team
  `.trim();

  return sendSNSNotification({
    email,
    subject: `Leave Request ${status === 'pending' ? 'Submitted' : status === 'approved' ? 'Approved' : 'Rejected'}`,
    message,
    employeeName
  });
};

/**
 * Test Lambda connection
 */
export const testLambdaConnection = async () => {
  try {
    const LAMBDA_URL = import.meta.env.VITE_LAMBDA_FUNCTION_URL;
    
    const response = await fetch(LAMBDA_URL, {
      method: 'GET'
    });
    
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Lambda function is reachable' : 'Lambda function returned an error'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to Lambda'
    };
  }
};

// =============================
// DynamoDB-backed APIs via Lambda
// =============================

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface LeaveRequestRecord {
  id: string;
  employeeId: string;
  employeeEmail: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

async function callLambda(payload: any) {
  if (!DYNAMODB_LAMBDA_URL) throw new Error('DynamoDB Lambda Function URL is not configured');
  const response = await fetch(DYNAMODB_LAMBDA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `Lambda error ${response.status}`);
  }
  return data;
}

export async function createEmployeeRecord(emp: EmployeeRecord) {
  try {
    const data = await callLambda({ action: 'createEmployee', employee: emp });
    return { success: true, data } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create employee' } as const;
  }
}

export async function listEmployeesFromBackend() {
  try {
    const data = await callLambda({ action: 'listEmployees' });
    return { success: true, employees: (data?.employees ?? []) as EmployeeRecord[] } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to list employees' } as const;
  }
}

export async function createLeaveRequestBackend(leave: LeaveRequestRecord) {
  try {
    const data = await callLambda({ action: 'createLeave', leave });
    return { success: true, data } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to create leave request' } as const;
  }
}

export async function listLeavesFromBackend(employeeEmail?: string) {
  try {
    const payload = employeeEmail ? { action: 'listLeaves', employeeEmail } : { action: 'listLeaves' };
    const data = await callLambda(payload);
    return { success: true, leaveRequests: (data?.leaveRequests ?? []) as LeaveRequestRecord[] } as const;
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Failed to list leave requests' } as const;
  }
}

/**
 * List all employees from DynamoDB
 */
export async function listEmployees() {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({ action: 'listEmployees' })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to list employees'
      };
    }

    return {
      success: true,
      employees: data.employees || []
    };
  } catch (error) {
    console.error('Error listing employees:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list employees'
    };
  }
}

/**
 * Update employee in DynamoDB
 */
export async function updateEmployee(email: string, updates: any) {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'updateEmployee',
        email,
        updates
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update employee'
      };
    }

    return {
      success: true,
      employee: data.employee
    };
  } catch (error) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update employee'
    };
  }
}

/**
 * Delete employee from DynamoDB
 */
export async function deleteEmployee(email: string) {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'deleteEmployee',
        email
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to delete employee'
      };
    }

    return {
      success: true,
      message: 'Employee deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete employee'
    };
  }
}

/**
 * Create leave request in DynamoDB
 */
export async function createLeaveRequest(data: {
  employeeEmail: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'createLeave',
        employeeEmail: data.employeeEmail,
        employeeName: data.employeeName,
        leaveType: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to create leave request'
      };
    }

    return {
      success: true,
      leaveRequest: result.leaveRequest
    };
  } catch (error) {
    console.error('Error creating leave request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create leave request'
    };
  }
}

/**
 * List leave requests from DynamoDB
 */
export async function listLeaveRequests(employeeEmail?: string) {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const payload: any = { action: 'listLeaves' };
    if (employeeEmail) {
      payload.employeeEmail = employeeEmail;
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to list leave requests'
      };
    }

    return {
      success: true,
      leaveRequests: data.leaveRequests || []
    };
  } catch (error) {
    console.error('Error listing leave requests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list leave requests'
    };
  }
}

/**
 * Update leave request status
 */
export async function updateLeaveStatus(requestId: string, status: 'approved' | 'rejected') {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'updateLeaveStatus',
        requestId,
        status
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update leave status'
      };
    }

    return {
      success: true,
      message: data.message
    };
  } catch (error) {
    console.error('Error updating leave status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update leave status'
    };
  }
}

/**
 * Validate employee login credentials
 */
export async function validateLogin(email: string, password: string) {
  try {
    if (!DYNAMODB_LAMBDA_URL) {
      throw new Error('DynamoDB Lambda Function URL is not configured');
    }

    const response = await fetch(DYNAMODB_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify({
        action: 'validateLogin',
        email,
        password
      })
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid credentials'
      };
    }

    return {
      success: true,
      employee: data.employee
    };
  } catch (error) {
    console.error('Error validating login:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate login'
    };
  }
}

