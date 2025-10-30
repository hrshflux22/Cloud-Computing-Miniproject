import { UserIcon, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface UserTypeSelectionProps {
  onSelectUserType: (userType: 'employee' | 'admin') => void;
}

export function UserTypeSelection({ onSelectUserType }: UserTypeSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Employee Management System
          </h1>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white" onClick={() => onSelectUserType('admin')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Admin</h3>
              <p className="text-sm text-muted-foreground mb-4">Access all management features</p>
              <Button variant="outline" className="w-full" onClick={() => onSelectUserType('admin')}>
                Login as Admin
              </Button>
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white" onClick={() => onSelectUserType('employee')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Employee</h3>
              <p className="text-sm text-muted-foreground mb-4">Access employee portal</p>
              <Button variant="outline" className="w-full" onClick={() => onSelectUserType('employee')}>
                Login as Employee
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}