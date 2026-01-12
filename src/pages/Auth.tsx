import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');
  const navigate = useNavigate();

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Check email availability before attempting signup
      const { data: availabilityData, error: availabilityError } = await supabase.functions.invoke(
        "check-email-availability",
        { body: { email: email.trim() } }
      );

      if (availabilityError) {
        console.error("Email availability check error:", availabilityError);
        // Continue with signup if check fails (fail open)
      } else if (availabilityData && !availabilityData.available) {
        // Email is not available
        if (availabilityData.reason === "RATE_LIMITED") {
          toast.error("Too many registration attempts. Please try again in 1 hour.", { duration: 8000 });
          setLoading(false);
          return;
        } else if (availabilityData.reason === "EXISTING_GOOGLE_ACCOUNT") {
          toast.error("An account with this email already exists. Please sign in with Google.", { duration: 6000 });
          setIsSignUp(false);
          setLoading(false);
          return;
        } else if (availabilityData.reason === "EXISTING_EMAIL_ACCOUNT") {
          toast.error("An account with this email already exists. Please sign in instead.", { duration: 6000 });
          setIsSignUp(false);
          setLoading(false);
          return;
        } else if (availabilityData.reason === "EXISTING_OAUTH_ACCOUNT") {
          toast.error(availabilityData.message || "An account with this email already exists.", { duration: 6000 });
          setIsSignUp(false);
          setLoading(false);
          return;
        } else if (availabilityData.reason === "RECENTLY_DELETED") {
          toast.error(availabilityData.message || "This email was recently used for a deleted account.", { duration: 6000 });
          setLoading(false);
          return;
        }
      }

      // Store intent in localStorage to handle after email confirmation
      if (intent) {
        localStorage.setItem('auth_intent', intent);
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("Check your email to confirm your account!", { duration: 6000 });
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      // Store intent in localStorage
      if (intent) {
        localStorage.setItem('auth_intent', intent);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Successful login - redirect to callback for consistent handling
      if (data.user) {
        navigate("/auth/callback");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Please confirm your email address first");
      } else {
        toast.error(error.message || "Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Store intent in localStorage to handle after OAuth redirect
      if (intent) {
        localStorage.setItem('auth_intent', intent);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Sign in failed");
      setLoading(false);
    }
  };
  
  const getIntentMessage = () => {
    if (intent === 'premium') {
      return 'Sign in to purchase Premium Plan and unlock Deep Analysis';
    } else if (intent === 'free') {
      return 'Sign in to start your free AI analysis';
    }
    return 'Access your AI-powered business insights';
  };

  return (
    <>
      <SEOHead
        title={isSignUp ? "Create Account" : "Sign In"}
        description="Sign in to Synoptas to access your AI-powered business strategies."
        canonical="/auth"
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
          <Button variant="outline" onClick={() => navigate("/")} className="transition-all duration-300">
            ← Back
          </Button>
        </div>

        <Card className="w-full max-w-md shadow-2xl relative z-10 animate-scale-in border-border/50">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-bold text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center text-base space-y-2">
              <span className="block">{getIntentMessage()}</span>
              {!intent && !isSignUp && (
                <span className="block text-sm text-red-500 dark:text-red-400 font-medium mt-3">
                  Premium users: Please use the same email as your purchase
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email/Password Form */}
            <form onSubmit={isSignUp ? handleEmailSignUp : handleEmailSignIn} className="space-y-4">
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
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isSignUp ? "Min. 8 characters" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="text-right">
                  <Link
                    to="/reset-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button
                type="submit"
                className="w-full shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </>
              )}
            </Button>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center text-sm">
              {isSignUp ? (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Create one
                  </button>
                </p>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By signing in, you accept our{" "}
              <a href="/terms-of-service" target="_blank" className="text-primary hover:underline">
                Terms of Service
              </a>
              {" "}and{" "}
              <a href="/privacy-policy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Auth;
