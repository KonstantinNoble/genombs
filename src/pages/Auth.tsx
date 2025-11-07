import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailVerificationDialog, setShowEmailVerificationDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        navigate("/");
      } else if (error) {
        await supabase.auth.signOut();
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      toast({
        title: "Terms of Service Required",
        description: "Please accept the Terms of Service to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const validatedData = signUpSchema.parse({ email, password });

      // Check email availability (30-day deletion blacklist)
      const { data: availabilityData, error: availabilityError } = await supabase.functions.invoke(
        "check-email-availability",
        { body: { email: validatedData.email } },
      );

      if (availabilityError) {
        console.error("Availability check failed:", availabilityError);
        // Fail-open: Continue with registration on error
      } else if (availabilityData && !availabilityData.available) {
        toast({
          title: "Registration Blocked",
          description: availabilityData.reason || "This email address cannot be used.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        setShowEmailVerificationDialog(true);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (
        error.message?.toLowerCase()?.includes("signups not allowed") ||
        error.message?.toLowerCase()?.includes("signup_disabled")
      ) {
        toast({
          title: "Sign-ups disabled",
          description: "Sign-ups are currently disabled. Please try again later.",
          variant: "destructive",
        });
      } else if (error.message?.toLowerCase()?.includes("already registered")) {
        toast({
          title: "Email already registered",
          description: "Please sign in or use a different email address.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = signInSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      if (!data?.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        toast({
          title: "Email not verified",
          description: "Please verify your email before signing in.",
          variant: "destructive",
        });
        return;
      }

      // GDPR safety: Check if profile exists after successful login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Account not found",
          description: "This account has been deleted.",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (
        error.message?.toLowerCase()?.includes("email not confirmed") ||
        error.message?.toLowerCase()?.includes("confirm your email")
      ) {
        toast({
          title: "Email not verified",
          description: "Please verify your email before signing in. You can resend the verification email below.",
          variant: "destructive",
        });
      } else if (error.message?.includes("Invalid login credentials")) {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Enter your email",
        description: "Please enter your email to resend the verification link.",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      toast({
        title: "Verification email sent",
        description: "Check your inbox (and spam) for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend",
        description: error.message ?? "Could not resend verification email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={showEmailVerificationDialog} onOpenChange={setShowEmailVerificationDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
              <span className="text-4xl">📧</span>
            </div>
            <AlertDialogTitle className="text-2xl text-center">Check Your Email!</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3">
              <p className="text-base">
                We've sent you a confirmation link.
              </p>
              <p className="text-base font-semibold text-foreground">
                Please click the link in your email to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                (Check your spam folder too)
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button
            onClick={() => {
              setShowEmailVerificationDialog(false);
              setIsLogin(true);
            }}
            className="w-full font-semibold transition-all duration-300 hover:scale-105"
          >
            Got it
          </Button>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">

      <div className="absolute top-8 left-8 z-10">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:border-primary"
        >
          ← Back
        </Button>
      </div>
      <Card className="w-full max-w-md bg-card border shadow-lg relative z-10 animate-scale-in">
        <CardHeader className="space-y-3">
          <CardTitle className="text-4xl font-bold text-center text-foreground">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isLogin ? "Sign in to access your AI-powered business insights" : "Join us and unlock intelligent business recommendations"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background"
              />
              {!isLogin && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I have read and accept the{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline font-medium" target="_blank">
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                disabled={loading || !email}
              >
                Resend verification email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
                setEmail("");
                setAcceptedTerms(false);
              }}
              className="text-base sm:text-lg text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-foreground font-bold text-lg sm:text-xl">{isLogin ? "Sign Up" : "Sign In"}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Auth;
