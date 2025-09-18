import { useState, useEffect } from "react";
import { Button } from "@focusdive/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { getCommonHeaders, API_URL } from "@/utils/api";
import { ThemeToggle } from "@/components/theme-toggle";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen = ({
  onLoginSuccess
}: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();

  // Restore login state when component mounts
  useEffect(() => {
    const savedEmail = localStorage.getItem("focusdive_login_email");
    const savedStep = localStorage.getItem("focusdive_login_step");
    
    if (savedEmail && savedStep === "token") {
      setEmail(savedEmail);
      setStep("token");
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      if (response.ok) {
        // Save email and step to localStorage for persistence
        localStorage.setItem("focusdive_login_email", email);
        localStorage.setItem("focusdive_login_step", "token");
        setStep("token");
        toast({
          title: "Check your email",
          description: "We've sent you a verification token. You can close this popup and reopen it after checking your email."
        });
      } else {
        throw new Error("Failed to send token");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify({ email, token }),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Clear temporary login state
        localStorage.removeItem("focusdive_login_email");
        localStorage.removeItem("focusdive_login_step");
        // Store auth token in localStorage
        localStorage.setItem("focusdive_token", data.token || "authenticated");
        localStorage.setItem("focusdive_email", email);
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in"
        });
        onLoginSuccess();
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    // Clear temporary login state when going back
    localStorage.removeItem("focusdive_login_email");
    localStorage.removeItem("focusdive_login_step");
    setStep("email");
    setToken("");
  };

  return <div className="w-full max-w-md mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Focus Dive</h1>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {step === "email" ? <>
                <Mail className="w-5 h-5 text-primary" />
                Sign In
              </> : <>
                <ShieldCheck className="w-5 h-5 text-primary" />
                Verify Token
              </>}
          </CardTitle>
          <CardDescription>
            {step === "email" ? "Enter your email to receive a verification token" : "Enter the token sent to your email"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" ? <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required disabled={isLoading} />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending token...
                  </> : "Send Verification Token"}
              </Button>
            </form> : <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">Verification Token</Label>
                <Input id="token" type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Enter token from email" required disabled={isLoading} />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </> : "Verify & Sign In"}
              </Button>
              
              <Button type="button" variant="ghost" className="w-full" onClick={handleBackToEmail} disabled={isLoading}>
                Back to Email
              </Button>
            </form>}
        </CardContent>
      </Card>
    </div>;
};
