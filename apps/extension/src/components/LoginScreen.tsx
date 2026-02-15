import { useState, useEffect } from "react";
import { Button } from "@focusdive/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRequestLoginToken, useVerifyLoginToken } from "@focusdive/auth";
import {
  clearLoginFlow,
  setLoginEmail,
  getLoginEmail,
  getLoginStep,
  setLoginStep,
} from "@/storage/authFlowStorage";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const {
    toast
  } = useToast();

  const requestLoginToken = useRequestLoginToken();
  const verifyLoginToken = useVerifyLoginToken();
  const isLoading = requestLoginToken.isPending || verifyLoginToken.isPending;

  useEffect(() => {
    (async () => {
      const [savedStep, savedEmail] = await Promise.all([
        getLoginStep(),
        getLoginEmail(),
      ]);

      setStep(savedStep);
      if (savedEmail) setEmail(savedEmail);
    })();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await requestLoginToken.mutateAsync({
        body: {
          email,
        }
      });
      await Promise.all([
        setLoginStep("token"),
        setLoginEmail(email),
      ]);
      setStep("token");
    } catch (_) {
      toast({
        title: "Error",
        description: "Failed to send verification token. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await verifyLoginToken.mutateAsync({
        body: {
          email,
          token,
        }
      });
      await setLoginStep("email");
      setStep(null);
    } catch (_) {
      toast({
        title: "Error",
        description: "Invalid token. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBackToEmail = () => {
    void clearLoginFlow();
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
