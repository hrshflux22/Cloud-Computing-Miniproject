import { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { AddEmployee } from './components/AddEmployee';
import { LeaveManagement } from './components/LeaveManagement';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ForgotPassword } from './components/ForgotPassword';
import { UserTypeSelection } from './components/UserTypeSelection';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { 
  createEmployee,
  listEmployees,
  updateEmployee,
  deleteEmployee,
  createLeaveRequest,
  listLeaveRequests,
  updateLeaveStatus,
  validateLogin
} from './services/lambdaService';

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced';
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

// Mock data
const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    position: 'Software Engineer',
    department: 'Information Technology',
    gender: 'male',
    maritalStatus: 'single',
    salary: 85000,
    status: 'active',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    position: 'Marketing Manager',
    department: 'Marketing',
    gender: 'female',
    maritalStatus: 'married',
    salary: 75000,
    status: 'active',
    joinDate: '2022-08-20'
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    position: 'Financial Analyst',
    department: 'Finance',
    gender: 'male',
    maritalStatus: 'married',
    salary: 65000,
    status: 'active',
    joinDate: '2023-03-10'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    position: 'HR Specialist',
    department: 'Human Resources',
    gender: 'female',
    maritalStatus: 'single',
    salary: 58000,
    status: 'active',
    joinDate: '2022-11-05'
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.wilson@company.com',
    position: 'Sales Representative',
    department: 'Sales',
    gender: 'male',
    maritalStatus: 'divorced',
    salary: 55000,
    status: 'inactive',
    joinDate: '2021-06-12'
  }
];

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Doe',
    type: 'Annual Leave',
    startDate: '2024-12-20',
    endDate: '2024-12-30',
    status: 'pending',
    reason: 'Christmas vacation with family',
    appliedDate: '2024-11-15'
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'Sick Leave',
    startDate: '2024-11-10',
    endDate: '2024-11-12',
    status: 'approved',
    reason: 'Medical appointment and recovery',
    appliedDate: '2024-11-08'
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'Michael Chen',
    type: 'Personal Leave',
    startDate: '2024-11-25',
    endDate: '2024-11-25',
    status: 'pending',
    reason: 'Family emergency',
    appliedDate: '2024-11-20'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'selection' | 'login' | 'signup' | 'forgot-password'>('selection');
  const [userType, setUserType] = useState<'employee' | 'admin'>('admin');
  const [activeUserType, setActiveUserType] = useState<'employee' | 'admin'>('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [loggedInEmployeeEmail, setLoggedInEmployeeEmail] = useState<string>('');
  
  // Store employee credentials (email -> password mapping)
    // Employee passwords are now sent via SNS email only
  // No passwords stored in frontend

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load employees and leave requests from DynamoDB on mount
  useEffect(() => {
    loadEmployees();
    loadLeaveRequests();
  }, []);

  const loadEmployees = async () => {
    try {
      console.log('Loading employees from DynamoDB...');
      const result = await listEmployees();
      console.log('List employees result:', result);
      
      if (result.success && result.employees) {
        setEmployees(result.employees as Employee[]);
        console.log('Loaded employees:', result.employees);
      } else if (result.error) {
        console.error('Failed to load employees:', result.error);
        toast.error('Failed to load employees from database');
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error connecting to database');
    }
  };

  const loadLeaveRequests = async () => {
    try {
      console.log('Loading leave requests from DynamoDB...');
      const result = await listLeaveRequests();
      console.log('List leave requests result:', result);
      
      if (result.success && result.leaveRequests) {
        // Transform DynamoDB data to match LeaveRequest interface
        const transformedRequests = result.leaveRequests.map((req: any) => ({
          id: req.requestId,
          employeeId: req.employeeEmail,
          employeeName: req.employeeName,
          type: req.type,
          startDate: req.startDate,
          endDate: req.endDate,
          status: req.status,
          reason: req.reason || '',
          appliedDate: req.appliedDate
        }));
        setLeaveRequests(transformedRequests);
        console.log('Loaded leave requests:', transformedRequests);
      } else if (result.error) {
        console.error('Failed to load leave requests:', result.error);
        toast.error('Failed to load leave requests from database');
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      toast.error('Error connecting to database');
    }
  };
  
  // No longer needed - Lambda generates and sends password via SNS

  const handleLogin = async (email: string, password: string, userType: 'employee' | 'admin') => {
    // Admin authentication
    if (userType === 'admin' && email === "Admin@gmail.com" && password === "admin") {
      setIsAuthenticated(true);
      setActiveUserType('admin');
      toast.success('Admin login successful! Welcome back.');
      return;
    }
    
    // Employee authentication - validate against DynamoDB
    if (userType === 'employee') {
      try {
        const result = await validateLogin(email, password);
        
        if (result.success) {
          setIsAuthenticated(true);
          setActiveUserType('employee');
          setLoggedInEmployeeEmail(email);
          toast.success('Employee login successful! Welcome back.');
        } else {
          toast.error(result.error || 'Invalid email or password');
        }
      } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed. Please try again.');
      }
      return;
    }
    
    // Invalid credentials
    toast.error('Invalid email or password');
  };
  
  const handleSelectUserType = (selectedType: 'employee' | 'admin') => {
    setUserType(selectedType);
    setAuthView(selectedType === 'employee' ? 'login' : 'login');
  };

  const handleSignup = (name: string, email: string, employeeId: string, userType: 'employee') => {
    // In production, this would:
    // 1. Validate the employee ID against HR database
    // 2. Create the account with a system-generated password
    // 3. Send the password to the employee's email
    
    setTimeout(() => {
      toast.success('Registration request submitted! Check your email for login credentials.');
      setAuthView('login');
      setUserType('employee'); // Set the user type to employee for login
    }, 1500); // Adding a small delay to simulate processing
  };

  const handleResetPassword = (email: string) => {
    // In production, this would call an API to send reset email
    toast.success('Password reset link sent to your email!');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthView('selection');
    setActiveSection('dashboard');
    toast.info('Logged out successfully');
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    if (editingEmployee) {
      // Update existing employee in DynamoDB
      const result = await updateEmployee(editingEmployee.email, {
        name: employeeData.name,
        position: employeeData.position,
        department: employeeData.department,
        salary: employeeData.salary,
        status: employeeData.status,
        gender: employeeData.gender,
        maritalStatus: employeeData.maritalStatus,
        joinDate: employeeData.joinDate
      });

      if (result.success) {
        // Reload from DynamoDB to ensure UI is in sync
        await loadEmployees();
        toast.success('Employee updated successfully!');
        setEditingEmployee(undefined);
        setActiveSection('employees');
      } else {
        toast.error(`Failed to update employee: ${result.error}`);
      }
    } else {
      // Add new employee to DynamoDB
      // Password is generated in Lambda and sent via SNS email
      const result = await createEmployee(
        employeeData.email,
        employeeData.name,
        '', // No password needed - Lambda generates it
        employeeData.position,
        employeeData.department,
        employeeData.salary,
        employeeData.gender,
        employeeData.maritalStatus
      );

      if (result.success) {
        // Update local state with returned employee data
        const newEmployee: Employee = {
          id: generateId(),
          ...employeeData
        };
        setEmployees(prev => [...prev, newEmployee]);
        
        if (result.emailSent) {
          toast.success('Employee created! Login credentials sent via email.');
        } else {
          toast.warning('Employee created but email could not be sent. Check SNS subscriptions.');
        }
        
        setActiveSection('employees');
        
        // Reload employees to ensure sync
        loadEmployees();
      } else {
        toast.error(`Failed to create employee: ${result.error}`);
      }
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setActiveSection('add-employee');
  };

  const handleDeleteEmployee = async (id: string) => {
    const employee = employees.find(emp => emp.id === id);
    if (employee && confirm(`Are you sure you want to delete ${employee.name}?`)) {
      const result = await deleteEmployee(employee.email);
      
      if (result.success) {
        // Reload from DynamoDB to ensure UI is in sync
        await loadEmployees();
        toast.success('Employee deleted successfully from DynamoDB!');
      } else {
        toast.error(`Failed to delete employee: ${result.error}`);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(undefined);
    setActiveSection('employees');
  };

  const handleAddLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'appliedDate'>) => {
    const employee = employees.find(e => e.id === requestData.employeeId);
    
    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    const result = await createLeaveRequest({
      employeeEmail: employee.email,
      employeeName: requestData.employeeName,
      type: requestData.type,
      startDate: requestData.startDate,
      endDate: requestData.endDate,
      reason: requestData.reason
    });

    if (result.success) {
      const newRequest: LeaveRequest = {
        ...requestData,
        id: result.leaveRequest?.requestId || generateId(),
        appliedDate: result.leaveRequest?.appliedDate || new Date().toISOString().split('T')[0]
      };
      setLeaveRequests(prev => [...prev, newRequest]);
      toast.success('Leave request submitted to DynamoDB!');
      
      // Reload leave requests to ensure sync
      loadLeaveRequests();
    } else {
      toast.error(`Failed to create leave request: ${result.error}`);
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    const leaveReq = leaveRequests.find(req => req.id === id);
    
    if (!leaveReq) {
      toast.error('Leave request not found');
      return;
    }

    const result = await updateLeaveStatus(leaveReq.id, status);
    
    if (result.success) {
      setLeaveRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      toast.success(`Leave request ${status} in DynamoDB!`);
    } else {
      toast.error(`Failed to update leave status: ${result.error}`);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard employees={employees} leaveRequests={leaveRequests} />;
      case 'employees':
        return (
          <EmployeeList
            employees={employees}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        );
      case 'add-employee':
        return (
          <AddEmployee
            onAddEmployee={handleAddEmployee}
            editingEmployee={editingEmployee as any}
            onCancelEdit={handleCancelEdit}
          />
        );
      case 'leave-management':
        return (
          <LeaveManagement
            employees={employees}
            leaveRequests={leaveRequests}
            onAddLeaveRequest={handleAddLeaveRequest}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
          />
        );
      default:
        return <Dashboard employees={employees} leaveRequests={leaveRequests} />;
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        authView === 'signup' ? (
          <Signup
            onSignup={handleSignup}
            onSwitchToLogin={() => setAuthView('login')}
          />
        ) : authView === 'forgot-password' ? (
          <ForgotPassword
            onResetPassword={handleResetPassword}
            onBackToLogin={() => setAuthView('login')}
          />
        ) : authView === 'selection' ? (
          <UserTypeSelection
            onSelectUserType={handleSelectUserType}
          />
        ) : (
          <Login
            userType={userType}
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthView('signup')}
            onForgotPassword={() => setAuthView('forgot-password')}
            onBackToSelection={() => setAuthView('selection')}
          />
        )
      ) : activeUserType === 'admin' ? (
        <div className="min-h-screen bg-background">
          <Navigation 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
            onLogout={handleLogout}
          />
          <main className="max-w-7xl mx-auto p-6">
            {renderContent()}
          </main>
        </div>
      ) : (
        <EmployeeDashboard onLogout={handleLogout} employeeEmail={loggedInEmployeeEmail} />
      )}
      
      {/* Employee Credential Modal - Only show when explicitly triggered */}
      <Toaster />
    </>
  );
}