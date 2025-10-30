import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { UserPlus, Save, X } from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
  role?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced';
}

interface AddEmployeeProps {
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
  editingEmployee?: Employee;
  onCancelEdit?: () => void;
}

export function AddEmployee({ onAddEmployee, editingEmployee, onCancelEdit }: AddEmployeeProps) {
  const [formData, setFormData] = useState({
    name: editingEmployee?.name || '',
    email: editingEmployee?.email || '',
    position: editingEmployee?.position || '',
    department: editingEmployee?.department || '',
    salary: editingEmployee?.salary?.toString() || '',
    status: editingEmployee?.status || 'active' as const,
    joinDate: editingEmployee?.joinDate || new Date().toISOString().split('T')[0],
    role: editingEmployee?.role || '',
    gender: editingEmployee?.gender || 'male' as const,
    maritalStatus: editingEmployee?.maritalStatus || 'single' as const,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  // Cleanup success message on unmount
  useEffect(() => {
    return () => {
      setSuccess(false);
    };
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const departments = [
    'Human Resources',
    'Information Technology', 
    'Finance',
    'Marketing',
    'Operations',
    'Sales',
    'Customer Service',
    'Legal',
    'Research & Development'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a valid positive number';
    }

    if (!formData.joinDate) {
      newErrors.joinDate = 'Join date is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Marital status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const employeeData = {
        ...formData,
        salary: Number(formData.salary)
      };
      
      onAddEmployee(employeeData);
      setSuccess(true);
      
      if (!editingEmployee) {
        // Reset form for new employee
        setFormData({
          name: '',
          email: '',
          position: '',
          department: '',
          salary: '',
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
          role: '',
          gender: 'male',
          maritalStatus: 'single',
        });
      }

      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <UserPlus className="w-6 h-6 mr-2 text-primary" />
          <h2 className="text-2xl font-semibold">
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Employee {editingEmployee ? 'updated' : 'added'} successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('position', e.target.value)}
                placeholder="Enter job position"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value: string) => handleInputChange('department', value)}>
                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Annual Salary($)*</Label>
              <Input
                id="salary"
                type="text" inputMode="numeric" pattern="[0-9]*"
                value={formData.salary}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('salary', e.target.value)}
                placeholder="Enter salary"
                min="0"
                className={errors.salary ? 'border-red-500' : ''}
              />
              {errors.salary && <p className="text-red-500 text-sm">{errors.salary}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date *</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('joinDate', e.target.value)}
                className={errors.joinDate ? 'border-red-500' : ''}
              />
              {errors.joinDate && <p className="text-red-500 text-sm">{errors.joinDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value: string) => handleInputChange('gender', value)}>
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: string) => handleInputChange('role', value)}>
                <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status *</Label>
              <Select value={formData.maritalStatus} onValueChange={(value: string) => handleInputChange('maritalStatus', value)}>
                <SelectTrigger className={errors.maritalStatus ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                </SelectContent>
              </Select>
              {errors.maritalStatus && <p className="text-red-500 text-sm">{errors.maritalStatus}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </Button>
            
            {editingEmployee && onCancelEdit && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}