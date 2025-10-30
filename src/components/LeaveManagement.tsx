import { useMemo, useState } from "react";
import { CheckCircle, XCircle, Clock, Filter, Search, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
  appliedDate: string;
}

interface LeaveManagementProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onAddLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'appliedDate'>) => void;
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected') => void;
}

export function LeaveManagement({ 
  leaveRequests, 
  onUpdateLeaveStatus 
}: LeaveManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "transition-all duration-300 hover:scale-105";
    switch (status) {
      case 'approved':
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`}>Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className={`${baseClasses} hover:bg-red-600`}>Rejected</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-orange-100 text-orange-800 hover:bg-orange-200`}>Pending</Badge>;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const sortedRequests = useMemo(() => {
    return [...leaveRequests].sort((a, b) => 
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    );
  }, [leaveRequests]);

  const filteredRequests = useMemo(() => {
    return sortedRequests.filter(request => {
      const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sortedRequests, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: leaveRequests.length,
      pending: leaveRequests.filter(r => r.status === 'pending').length,
      approved: leaveRequests.filter(r => r.status === 'approved').length,
      rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    };
  }, [leaveRequests]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Requests</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <CalendarIcon className="w-8 h-8 text-blue-500 opacity-75" />
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending</p>
              <p className="text-2xl font-bold mt-1 text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-75" />
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Approved</p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-75" />
          </div>
        </Card>
        
        <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Rejected</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-75" />
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Leave Records
          </h2>
        </div>
        
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/70 transition-colors">
                  <TableHead className="font-bold">Employee</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Start Date</TableHead>
                  <TableHead className="font-bold">End Date</TableHead>
                  <TableHead className="font-bold">Duration</TableHead>
                  <TableHead className="font-bold">Applied Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow 
                    key={request.id} 
                    className={`transition-all duration-300 ${
                      hoveredRow === request.id 
                        ? 'bg-blue-50/50 scale-[1.01] shadow-md' 
                        : 'hover:bg-muted/30'
                    }`}
                    onMouseEnter={() => setHoveredRow(request.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          request.status === 'approved' ? 'bg-green-500 animate-pulse' :
                          request.status === 'rejected' ? 'bg-red-500' :
                          'bg-orange-500 animate-pulse'
                        }`} />
                        {request.employeeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                        {request.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(request.startDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{new Date(request.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-sm font-semibold">
                        {calculateDays(request.startDate, request.endDate)} day(s)
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(request.appliedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="transition-transform duration-300 hover:scale-125">
                          {getStatusIcon(request.status)}
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateLeaveStatus(request.id, 'approved')}
                            className="text-green-600 hover:bg-green-50 hover:border-green-300 hover:scale-110 transition-all duration-300 hover:shadow-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateLeaveStatus(request.id, 'rejected')}
                            className="text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-110 transition-all duration-300 hover:shadow-md"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className="text-sm text-muted-foreground italic">No actions</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 animate-in fade-in duration-500">
            <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4 animate-bounce" />
            <p className="text-muted-foreground text-lg font-medium">
              {searchTerm || statusFilter !== "all" 
                ? "No matching leave requests found." 
                : "No leave requests found."}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search term.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}