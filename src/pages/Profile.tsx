import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { User } from "@supabase/supabase-js";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { BadgeGallery } from "@/components/gamification/BadgeGallery";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import CreditResetTimer from "@/components/chat/CreditResetTimer";

const Profile = () => {
  const { remainingCredits, creditsLimit, creditsResetAt } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [credits, setCredits] = useState<{
    is_premium: boolean;
    premium_since: string | null;
    subscription_end_date: string | null;
    next_payment_date: string | null;
    auto_renew: boolean | null;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { openCheckout } = useFreemiusCheckout();

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

      if (session.user) {
        const { data } = await supabase
          .from("user_credits")
          .select("is_premium, premium_since, subscription_end_date, next_payment_date, auto_renew")
          .eq("user_id", session.user.id)
          .maybeSingle();

        setCredits(data);
      }
    };

    getProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
    if (!user) return;

    setDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
        body: {},
      });

      if (error) throw error;

      await supabase.auth.signOut();

      toast({
        title: "Account deleted",
        description: "Your account and all data have been permanently deleted.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Profile Settings"
        description="Manage your Synvertas account settings and preferences."
        canonical="/profile"
        noindex={true}
      />
      <div className="min-h-screen bg-background/80">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-semibold text-primary mb-2">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
            <Card className="bg-card border-border shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Account Information</CardTitle>
                <CardDescription>Your registered email and account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Your registered email address</p>
                </div>

                <div className="space-y-2">
                  <Label>Premium Status</Label>
                  <div className="p-3 bg-muted rounded-md border border-border">
                    {credits?.is_premium ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-green-600 dark:text-green-500 font-medium">Premium Active</span>
                          {credits.premium_since && (
                            <span className="text-xs text-muted-foreground">
                              Since {new Date(credits.premium_since).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {credits.subscription_end_date && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Valid until: </span>
                            <span className="font-medium">
                              {new Date(credits.subscription_end_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {credits.auto_renew === null ? (
                            <span className="text-muted-foreground text-sm">Status unknown — sync may be pending</span>
                          ) : credits.auto_renew ? (
                            <>
                              <span className="text-green-600 dark:text-green-500 text-sm">Auto-renewal active</span>
                              {credits.next_payment_date && (
                                <span className="text-xs text-muted-foreground">
                                  Next payment: {new Date(credits.next_payment_date).toLocaleDateString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-500 text-sm">
                              Auto-renewal canceled — expires on{" "}
                              {credits.subscription_end_date
                                ? new Date(credits.subscription_end_date).toLocaleDateString()
                                : "subscription end"}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-muted-foreground">Free Plan</span>
                        <Button onClick={() => openCheckout(user.email || undefined)} className="w-full">
                          Upgrade to Premium
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-border" />
              </CardContent>
            </Card>

            {/* Credits Card */}
            <Card className="bg-card border-border shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl">Credits</CardTitle>
                <CardDescription>Your daily analysis credits and reset schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Remaining today</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {remainingCredits} <span className="text-muted-foreground font-normal">/ {creditsLimit} credits</span>
                  </span>
                </div>
                <Progress
                  value={creditsLimit > 0 ? (remainingCredits / creditsLimit) * 100 : 0}
                  className="h-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resets in</span>
                  <CreditResetTimer creditsResetAt={creditsResetAt} />
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="bg-card border-border shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Progress & Achievements</CardTitle>
                    <CardDescription className="mt-1">Your badges, streaks, and analysis history</CardDescription>
                  </div>
                  {/* Outline button – arrow slides right on hover */}
                  <Link to="/achievements">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 shrink-0 group transition-colors duration-200 hover:border-primary/50"
                    >
                      View all
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <BadgeGallery userId={user.id} size="sm" />
                <div className="mt-4 px-4">
                  {/* Primary button – scale + arrow slide + subtle shimmer on hover */}
                  <Link to="/achievements" className="block group">
                    <Button className="w-full gap-2 relative overflow-hidden transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md group-hover:shadow-primary/20 active:scale-[0.98]">
                      {/* Shimmer overlay */}
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                      Open Achievements
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="bg-card border-border shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Account Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full hover:scale-105 transition-transform duration-300"
                  >
                    Sign Out
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto min-h-[44px] sm:min-h-0"
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
    </>
  );
};

export default Profile;
