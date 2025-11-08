import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const WelcomePremium = () => {
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, redirect to profile
        navigate("/profile");
      }
    };
    checkSession();
  }, [navigate]);

  const handleResendMagicLink = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Magic Link Sent! ✨",
        description: "Check your inbox for the login link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Welcome to Premium - Wealthconomy</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-20">
        <Card className="max-w-2xl mx-auto p-6 md:p-8 text-center shadow-lg">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto text-green-500 mb-4 animate-fade-in" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
              🎉 Premium Activated!
            </h1>
            <p className="text-muted-foreground text-lg">
              Welcome to Wealthconomy Premium
            </p>
          </div>

          <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6 mb-6">
            <Mail className="w-12 h-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl md:text-2xl font-semibold mb-2 text-foreground">
              Check your email!
            </h2>
            <p className="text-foreground/80 mb-4">
              We've sent you a <strong>magic login link</strong> to complete your setup.
              Click the link in the email to access your premium account.
            </p>
            <p className="text-sm text-muted-foreground">
              📧 Email sent to the address you used on Whop
            </p>
          </div>

          <div className="space-y-4 mb-6 text-left">
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Unlimited AI analyses</span>
            </div>
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Priority support</span>
            </div>
            <div className="flex items-start">
              <Sparkles className="w-5 h-5 mr-2 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Advanced analytics</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or resend it:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResendMagicLink()}
              />
              <Button 
                onClick={handleResendMagicLink} 
                variant="outline"
                disabled={isResending}
                className="sm:w-auto"
              >
                {isResending ? "Sending..." : "Resend Magic Link"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WelcomePremium;
