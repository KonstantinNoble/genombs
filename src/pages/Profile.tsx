import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@supabase/supabase-js";
import { useWhopMembership } from "@/hooks/useWhopMembership";
import { Sparkles, ExternalLink } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremium, isLoading: premiumLoading, membershipStatus, validUntil } = useWhopMembership();

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Load analysis count
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('analysis_count')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      setAnalysisCount(creditsData?.analysis_count || 0);
    };

    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    // For Whop users, redirect to subscription management
    toast({
      title: "Account Deletion",
      description: "Please cancel your subscription on Whop first, then contact support to delete your account.",
      variant: "destructive",
      duration: 6000,
    });
    window.open('https://whop.com/hub', '_blank');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
            {isPremium && (
              <Badge variant="default" className="mt-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-2 text-base shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Premium Member
              </Badge>
            )}
          </div>
          {/* Premium Status Card */}
          {isPremium && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-elegant hover:shadow-hover transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Premium Subscription
                </CardTitle>
                <CardDescription>
                  Active subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-background/50">
                  <span className="text-foreground/80">Status</span>
                  <Badge variant="default" className="bg-green-600">
                    {membershipStatus === 'active' ? 'Active ✅' : membershipStatus}
                  </Badge>
                </div>
                {validUntil && (
                  <div className="flex justify-between items-center p-4 rounded-lg bg-background/50">
                    <span className="text-foreground/80">Valid Until</span>
                    <span className="font-semibold">{new Date(validUntil).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-4 rounded-lg bg-background/50">
                  <span className="text-foreground/80">AI Analyses</span>
                  <span className="font-semibold text-primary">Unlimited ✨</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open('https://whop.com/hub', '_blank')}
                >
                  Manage Subscription
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats Card */}
          <Card className="bg-card border-border shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">Usage Statistics</CardTitle>
              <CardDescription>
                Your current usage and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                <span className="text-foreground/80">Analyses Today</span>
                {isPremium ? (
                  <span className="font-semibold text-primary">Unlimited ✨</span>
                ) : (
                  <span className="font-semibold">{analysisCount}/2</span>
                )}
              </div>
              {!isPremium && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-foreground/80 mb-3">
                    Upgrade to Premium for unlimited analyses and more features!
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-elegant hover:shadow-hover transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-2xl">Account Information</CardTitle>
              <CardDescription>
                Your registered email and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your registered email address
                </p>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full hover:scale-105 transition-transform duration-300"
                >
                  Sign Out
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                    >
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Deleting..." : "Delete Account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
