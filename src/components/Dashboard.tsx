import { Users, UserCheck, Calendar, Clock } from "lucide-react";
import { Card } from "./ui/card";

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
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
}

interface DashboardProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
}

export function Dashboard({ employees, leaveRequests }: DashboardProps) {
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'active').length,
    pendingLeaves: leaveRequests.filter(req => req.status === 'pending').length,
    approvedLeaves: leaveRequests.filter(req => req.status === 'approved').length
  };

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Employees", 
      value: stats.activeEmployees,
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Pending Leave Requests",
      value: stats.pendingLeaves,
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Approved Leaves",
      value: stats.approvedLeaves,
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 transition-all duration-200 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-semibold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Employees</h3>
          <div className="space-y-3">
            {employees.slice(-5).reverse().map((employee) => (
              <div key={employee.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  employee.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.slice(-5).reverse().map((request) => (
              <div key={request.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <div>
                  <p className="font-medium">{request.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{request.type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}