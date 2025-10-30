import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface LoginProps {
  onLogin: (email: string, password: string, userType: 'employee' | 'admin') => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  userType: 'employee' | 'admin';
  onBackToSelection: () => void;
}

export function Login({ onLogin, onSwitchToSignup, onForgotPassword, userType, onBackToSelection }: LoginProps) {
  const [email, setEmail] = useState(userType === "admin" ? "Admin@gmail.com" : "");
  const [password, setPassword] = useState(userType === "admin" ? "admin" : "");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    onLogin(email, password, userType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xs">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Nimbus HR
          </h1>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <LogIn className="w-5 h-5 mr-2 text-primary" />
              <h2 className="text-xl font-semibold">
                {userType === 'admin' ? 'Admin Login' : 'Employee Login'}
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackToSelection} 
              className="text-xs"
            >
              Change User Type
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            
            {userType === 'employee' && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
