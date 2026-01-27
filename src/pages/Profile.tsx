import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@supabase/supabase-js";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTeam } from "@/contexts/TeamContext";
import { Building2, AlertTriangle, ArrowRight, Settings } from "lucide-react";

interface OwnedTeam {
  id: string;
  name: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [ownedTeams, setOwnedTeams] = useState<OwnedTeam[]>([]);
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
  const { teams } = useTeam();

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

      // Fetch user credits/premium status
      if (session.user) {
        const { data } = await supabase
          .from('user_credits')
          .select('is_premium, premium_since, subscription_end_date, next_payment_date, auto_renew')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setCredits(data);
      }
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
    if (!user) return;

    // Check for owned teams first (client-side check, server also validates)
    const userOwnedTeams = teams.filter(t => t.role === "owner");
    if (userOwnedTeams.length > 0) {
      setOwnedTeams(userOwnedTeams.map(t => ({ id: t.id, name: t.name })));
      toast({
        title: "Delete workspaces first",
        description: "You must delete your workspaces before deleting your account.",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        method: "POST",
        body: {},
      });
      
      // Handle team ownership error from server
      if (data?.error === "TRANSFER_OWNERSHIP_REQUIRED") {
        setOwnedTeams(data.teams || []);
        toast({
          title: "Delete workspaces first",
          description: "You must delete your workspaces before deleting your account.",
          variant: "destructive",
        });
        setDeleting(false);
        return;
      }
      
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
        description="Manage your Synoptas account settings and preferences."
        canonical="/profile"
        noindex={true}
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
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


              <div className="space-y-2">
                <Label>Premium Status</Label>
                <div className="p-3 bg-muted rounded-md border border-border">
                  {credits?.is_premium ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-green-600 dark:text-green-500 font-medium">✓ Premium Active</span>
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
                          <span className="text-muted-foreground text-sm">
                            ⓘ Status unknown - sync with Freemius may be pending
                          </span>
                        ) : credits.auto_renew ? (
                          <>
                            <span className="text-green-600 dark:text-green-500 text-sm">
                              ✓ Auto-renewal active
                            </span>
                            {credits.next_payment_date && (
                              <span className="text-xs text-muted-foreground">
                                Next payment: {new Date(credits.next_payment_date).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-orange-600 dark:text-orange-500 text-sm">
                            ⚠ Auto-renewal canceled - expires on {credits.subscription_end_date 
                              ? new Date(credits.subscription_end_date).toLocaleDateString() 
                              : 'subscription end'}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <span className="text-muted-foreground">Free Plan</span>
                      <Button
                        onClick={() => openCheckout(user.email || undefined)}
                        className="w-full"
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* My Teams Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>My Teams</Label>
                  <Link 
                    to="/teams" 
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="p-3 bg-muted rounded-md border border-border space-y-2">
                  {teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {credits?.is_premium 
                        ? "You're not part of any teams yet."
                        : "Upgrade to Premium to create and join teams."
                      }
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {teams.slice(0, 3).map(team => (
                        <div key={team.id} className="flex flex-col xs:flex-row xs:items-center justify-between p-3 rounded-lg bg-background border gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium truncate">{team.name}</span>
                            <span className="text-xs text-muted-foreground capitalize shrink-0">({team.role})</span>
                          </div>
                          {(team.role === "owner" || team.role === "admin") && (
                            <Link 
                              to="/team/members" 
                              className="text-xs text-primary hover:underline flex items-center gap-1 py-2 px-3 -mx-1 rounded-md hover:bg-primary/5 transition-colors min-h-[44px] xs:min-h-0 justify-center xs:justify-start"
                            >
                              <Settings className="h-3 w-3" />
                              Manage
                            </Link>
                          )}
                        </div>
                      ))}
                      {teams.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center pt-1">
                          +{teams.length - 3} more teams
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-border space-y-4">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full hover:scale-105 transition-transform duration-300"
                >
                  Sign Out
                </Button>

                {/* Team ownership warning */}
                {ownedTeams.length > 0 && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-destructive">
                          Workspace action required
                        </p>
                        <p className="text-xs text-muted-foreground">
                          You own the following workspaces. Before deleting your account, you must delete them first:
                        </p>
                        <ul className="space-y-2">
                          {ownedTeams.map(team => (
                            <li key={team.id} className="flex items-center gap-2 text-sm">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">{team.name}</span>
                              <Link 
                                to="/team/settings" 
                                className="ml-auto text-destructive text-xs hover:underline"
                              >
                                Delete Workspace
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={ownedTeams.length > 0}
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
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="w-full sm:w-auto min-h-[44px] sm:min-h-0">Cancel</AlertDialogCancel>
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
