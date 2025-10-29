import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
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
        'check-email-availability',
        { body: { email: validatedData.email } }
      );

      if (availabilityError) {
        console.error('Availability check failed:', availabilityError);
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
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
        });
        setIsLogin(true);
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
      } else if (error.message?.toLowerCase()?.includes("signups not allowed") || error.message?.toLowerCase()?.includes("signup_disabled")) {
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
      } else if (error.message?.toLowerCase()?.includes("email not confirmed") || error.message?.toLowerCase()?.includes("confirm your email")) {
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
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="absolute top-8 left-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Sign in to access your account"
              : "Sign up to start your investment journey"}
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
              {!isLogin && (
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I have read and accept the{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-secondary hover:underline font-medium"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>
                  .
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-secondary to-[hsl(38,100%,50%)] text-primary font-semibold hover:shadow-xl transition-all duration-300"
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
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-secondary font-semibold">
                {isLogin ? "Sign Up" : "Sign In"}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
