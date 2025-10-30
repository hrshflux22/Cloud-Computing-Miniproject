import { Users, UserPlus, Calendar, BarChart3, LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

export function Navigation({ activeSection, onSectionChange, onLogout }: NavigationProps) {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'add-employee', label: 'Add Employee', icon: UserPlus },
    { id: 'leave-management', label: 'Leave Management', icon: Calendar }
  ];

  return (
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
                  variant={activeSection === section.id ? "default" : "outline"}
                  onClick={() => onSectionChange(section.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </Button>
              );
            })}
            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}