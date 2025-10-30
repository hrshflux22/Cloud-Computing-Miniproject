import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { 
  User, 
  ClipboardList, 
  CalendarDays, 
  Clock, 
  FileText,
  LogOut,
  X
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { listEmployees, createLeaveRequest, listLeaveRequests } from "../services/lambdaService";

interface EmployeeInfo {
  email: string;
  name: string;
  position: string;
  department: string;
  salary: string;
  status: string;
  joinDate: string;
  gender?: string;
  maritalStatus?: string;
}

interface LeaveBalance {
  category: string;
  total: number;
  used: number;
  remaining: number;
}

interface LeaveRequest {
  requestId: string;
  employeeEmail: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  appliedDate: string;
}

interface EmployeeDashboardProps {
  onLogout: () => void;
  employeeEmail?: string;
}

export function EmployeeDashboard({ onLogout, employeeEmail }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState<EmployeeInfo | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    type: "Annual Leave",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ""
  });

  // Load employee data from DynamoDB
  useEffect(() => {
    const loadEmployeeData = async () => {
      if (!employeeEmail) {
        console.error('No employee email provided to dashboard');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Loading employee data for:', employeeEmail);
        
        // Load employee profile
        const result = await listEmployees();
        console.log('Employees API result:', result);
        
        if (result.success && result.employees) {
          console.log('Total employees loaded:', result.employees.length);
          
          const employee = result.employees.find((emp: any) => emp.email === employeeEmail);
          console.log('Found employee:', employee);
          
          if (employee) {
            setEmployeeInfo(employee);
          } else {
            console.error('Employee not found in database:', employeeEmail);
            toast.error(`Employee account not found. Please contact your administrator.`);
          }
        } else {
          console.error('Failed to load employees:', result.error);
          toast.error('Failed to load employee data');
        }

        // Load leave requests for this employee
        const leavesResult = await listLeaveRequests(employeeEmail);
        console.log('Leave requests API result:', leavesResult);
        
        if (leavesResult.success && leavesResult.leaveRequests) {
          console.log('Leave requests loaded:', leavesResult.leaveRequests.length);
          setLeaveRequests(leavesResult.leaveRequests);
        } else {
          console.error('Failed to load leave requests:', leavesResult.error);
        }
      } catch (error) {
        console.error('Error loading employee data:', error);
        toast.error('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    loadEmployeeData();
  }, [employeeEmail]);

  // Get actual employee data based on logged-in email
  const getEmployeeName = () => {
    if (employeeInfo?.name) return employeeInfo.name;
    if (!employeeEmail) return "Employee";
    // Extract name from email (before @)
    const namePart = employeeEmail.split('@')[0];
    // Convert to readable format (e.g., "john.doe" -> "John Doe")
    return namePart
      .split(/[._]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate leave balances from DynamoDB leave requests
  const calculateLeaveBalances = (): LeaveBalance[] => {
    const totalDays = {
      "Annual Leave": 20,
      "Sick Leave": 10,
      "Personal Leave": 5
    };

    const usedDays = {
      "Annual Leave": 0,
      "Sick Leave": 0,
      "Personal Leave": 0
    };

    // Calculate used days from approved leave requests
    leaveRequests
      .filter(req => req.status === 'approved')
      .forEach(req => {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (req.type in usedDays) {
          usedDays[req.type as keyof typeof usedDays] += days;
        }
      });

    return Object.entries(totalDays).map(([category, total]) => ({
      category,
      total,
      used: usedDays[category as keyof typeof usedDays],
      remaining: total - usedDays[category as keyof typeof usedDays]
    }));
  };

  const leaveBalances = calculateLeaveBalances();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-amber-100 text-amber-800';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLeaveInputChange = (field: string, value: string) => {
    setNewLeaveRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleLeaveSubmit = async () => {
    if (!employeeEmail || !employeeInfo) {
      toast.error('Employee information not loaded');
      return;
    }

    // Validate dates
    if (new Date(newLeaveRequest.startDate) > new Date(newLeaveRequest.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (!newLeaveRequest.reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }

    try {
      // Submit leave request to DynamoDB
      await createLeaveRequest({
        employeeEmail: employeeEmail,
        employeeName: employeeInfo.name,
        type: newLeaveRequest.type,
        startDate: newLeaveRequest.startDate,
        endDate: newLeaveRequest.endDate,
        reason: newLeaveRequest.reason
      });

      // Reload leave requests
      const leavesResult = await listLeaveRequests(employeeEmail);
      if (leavesResult.success && leavesResult.leaveRequests) {
        setLeaveRequests(leavesResult.leaveRequests);
      }
      
      // Close the dialog and show success message
      setLeaveDialogOpen(false);
      toast.success('Leave request submitted successfully!');

      // Reset the form
      setNewLeaveRequest({
        type: "Annual Leave",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: ""
      });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  // Navigation sections
  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'leave', label: 'Leave', icon: CalendarDays }
  ];
  
  // Close any open dialogs when switching tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLeaveDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation header */}
      <nav className="bg-card border-b border-border p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-foreground">
              Nimbus HR
            </h1>
            <div className="flex space-x-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.id}
                    variant={activeTab === section.id ? "default" : "outline"}
                    onClick={() => handleTabChange(section.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </Button>
                );
              })}
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto p-6">

        {activeTab === "profile" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : !employeeInfo ? (
              <div className="text-center py-8">Employee information not found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee profile card */}
                <Card className="p-6 md:col-span-1">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <User size={48} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">{employeeInfo.name}</h2>
                    <p className="text-sm text-muted-foreground">{employeeInfo.position}</p>
                    <p className="text-sm text-muted-foreground">{employeeInfo.department}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm mb-2">
                      <span className="font-medium block mb-1">Email:</span>
                      <span className="break-all">{employeeInfo.email}</span>
                    </p>
                    <p className="text-sm flex items-center gap-2 mb-2">
                      <span className="font-medium">Status:</span> 
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(employeeInfo.status)}`}>
                        {employeeInfo.status}
                      </span>
                    </p>
                  </div>
                </Card>

                {/* Employee details */}
                <Card className="p-6 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p>{employeeInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <p className="break-all">{employeeInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p>{employeeInfo.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p>{employeeInfo.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p>${employeeInfo.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joining Date</p>
                      <p>{new Date(employeeInfo.joinDate).toLocaleDateString()}</p>
                    </div>
                    {employeeInfo.gender && (
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p>{employeeInfo.gender.charAt(0).toUpperCase() + employeeInfo.gender.slice(1).toLowerCase()}</p>
                      </div>
                    )}
                    {employeeInfo.maritalStatus && (
                      <div>
                        <p className="text-sm text-muted-foreground">Marital Status</p>
                        <p>{employeeInfo.maritalStatus.charAt(0).toUpperCase() + employeeInfo.maritalStatus.slice(1).toLowerCase()}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "leave" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {leaveBalances.map((leave, index) => (
                <Card key={index} className="p-6 transition-all duration-200 hover:shadow-lg">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-muted-foreground">{leave.category}</p>
                    <p className="text-3xl font-semibold mt-2">{leave.remaining}</p>
                    <p className="text-sm text-muted-foreground mt-1">Days Remaining</p>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${(leave.used/leave.total)*100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {leave.used} used of {leave.total} days
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Leave Requests</h3>
                <Button onClick={() => setLeaveDialogOpen(true)}>Request Leave</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Type</th>
                      <th className="text-left py-2 font-medium">Period</th>
                      <th className="text-left py-2 font-medium">Applied On</th>
                      <th className="text-left py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">Loading leave requests...</td>
                      </tr>
                    ) : leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted-foreground">No leave requests found</td>
                      </tr>
                    ) : (
                      leaveRequests.map((leave) => (
                        <tr key={leave.requestId} className="border-b">
                          <td className="py-2">{leave.type}</td>
                          <td className="py-2">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </td>
                          <td className="py-2">{new Date(leave.appliedDate).toLocaleDateString()}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(leave.status)}`}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}


      </main>

      {/* Leave Request Modal - Right Side Popup */}
      {leaveDialogOpen && activeTab === "leave" && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div 
            className={`fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-lg p-6 h-full overflow-y-auto transform transition-transform duration-300 ease-in-out ${leaveDialogOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pt-2 pb-4 border-b">
              <h3 className="text-xl font-semibold">Request Leave</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setLeaveDialogOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Fill out the form below to submit a new leave request.
            </p>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="leave-type">Leave Type</Label>
                <Select 
                  value={newLeaveRequest.type} 
                  onValueChange={(value) => handleLeaveInputChange('type', value)}
                >
                  <SelectTrigger id="leave-type">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newLeaveRequest.startDate}
                    onChange={(e) => handleLeaveInputChange('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newLeaveRequest.endDate}
                    onChange={(e) => handleLeaveInputChange('endDate', e.target.value)}
                    min={newLeaveRequest.startDate}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  value={newLeaveRequest.reason}
                  onChange={(e) => handleLeaveInputChange('reason', e.target.value)}
                  placeholder="Please provide a brief reason for your leave request"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t">
              <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleLeaveSubmit}>Submit Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}