import { useState } from "react";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
  onResetPassword: (email: string) => void;
}

export function ForgotPassword({ onBackToLogin, onResetPassword }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword(email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Nimbus HR
          </h1>
          <p className="text-white/90 text-sm">Reset your password</p>
        </div>

        {/* Forgot Password Card */}
        <Card className="p-8 shadow-2xl">
          <div className="flex items-center mb-6">
            <Mail className="w-6 h-6 mr-2 text-primary" />
            <h2 className="text-2xl font-semibold">Forgot Password</h2>
          </div>

          {isSubmitted ? (
            <div className="space-y-6">
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Password reset instructions have been sent to your email address. Please check your inbox and follow the link to reset your password.
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Resend Email
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={onBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
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
              </div>

              <Button
                type="submit"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reset Link
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-sm text-primary hover:underline font-medium transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
