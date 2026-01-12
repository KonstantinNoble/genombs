import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle, Clock, UserPlus, LogIn } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

type ResetState = "idle" | "loading" | "success" | "no_account" | "rate_limited" | "oauth_only";

const ResetPassword = () => {
  const [state, setState] = useState<ResetState>("idle");
  const [email, setEmail] = useState("");
  const [waitMinutes, setWaitMinutes] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [oauthProvider, setOauthProvider] = useState<string>("");
  const navigate = useNavigate();

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setState("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setState("loading");
    
    try {
      const { data, error } = await supabase.functions.invoke("check-reset-eligibility", {
        body: {
          email: email.trim(),
          redirectUrl: `${window.location.origin}/update-password`,
        },
      });

      if (error) throw error;

      if (data.error === "NO_ACCOUNT") {
        setState("no_account");
        return;
      }

      if (data.error === "RATE_LIMITED") {
        setState("rate_limited");
        setWaitMinutes(data.waitMinutes);
        setCountdown(data.waitMinutes * 60);
        return;
      }

      if (data.error === "OAUTH_ONLY") {
        setState("oauth_only");
        setOauthProvider(data.provider || "google");
        return;
      }

      if (data.success) {
        setState("success");
        // Start countdown immediately after successful email send (60 minutes)
        setWaitMinutes(60);
        setCountdown(60 * 60);
        toast.success("Check your email for the reset link!", { duration: 6000 });
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset email");
      setState("idle");
    }
  };

  const renderContent = () => {
    switch (state) {
      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
            </p>
            {countdown > 0 && (
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">
                  You can request another link in <span className="font-mono font-semibold text-foreground">{formatCountdown(countdown)}</span>
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder.
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Return to Sign In
            </Button>
          </div>
        );

      case "no_account":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <UserPlus className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No Account Found</h3>
              <p className="text-muted-foreground">
                There is no account registered with <strong>{email}</strong>.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Create an Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setState("idle")} 
                className="w-full"
              >
                Try a Different Email
              </Button>
            </div>
          </div>
        );

      case "rate_limited":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-accent-warm/10 p-4">
                <Clock className="h-12 w-12 text-accent-warm" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Please Wait</h3>
              <p className="text-muted-foreground">
                You've recently requested a password reset. For security reasons, please wait before trying again.
              </p>
            </div>
            {countdown > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
                <p className="text-2xl font-mono font-bold text-foreground">
                  {formatCountdown(countdown)}
                </p>
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")} 
              className="w-full"
            >
              Return to Sign In
            </Button>
          </div>
        );

      case "oauth_only":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <LogIn className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Use {oauthProvider === 'google' ? 'Google' : oauthProvider} Sign-In</h3>
              <p className="text-muted-foreground">
                The account for <strong>{email}</strong> was created using {oauthProvider === 'google' ? 'Google' : oauthProvider} Sign-In and doesn't have a password.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign in with {oauthProvider === 'google' ? 'Google' : oauthProvider}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setState("idle")} 
                className="w-full"
              >
                Try a Different Email
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={state === "loading"}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base"
              disabled={state === "loading"}
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        );
    }
  };

  const getTitle = () => {
    switch (state) {
      case "success": return "Check Your Email";
      case "no_account": return "Account Not Found";
      case "rate_limited": return "Too Many Requests";
      case "oauth_only": return "No Password Required";
      default: return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (state) {
      case "success": return "We've sent you a link to reset your password.";
      case "no_account": return "We couldn't find an account with that email.";
      case "rate_limited": return "Please wait before requesting another reset.";
      case "oauth_only": return "This account uses social sign-in.";
      default: return "Enter your email address and we'll send you a link to reset your password.";
    }
  };

  return (
    <>
      <SEOHead
        title="Reset Password"
        description="Reset your Synoptas password."
        canonical="/reset-password"
        noindex={true}
      />
      <div className="min-h-screen flex items-center justify-center bg-background/80 backdrop-blur-[8px] p-4 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute top-8 left-8 z-10">
          <Button variant="outline" onClick={() => navigate("/auth")} className="transition-all duration-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Button>
        </div>

        <Card className="w-full max-w-md shadow-2xl relative z-10 animate-scale-in border-border/50">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-bold text-center">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ResetPassword;
