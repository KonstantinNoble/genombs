import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User } from "@supabase/supabase-js";
import { useFreemiusCheckout } from "@/hooks/useFreemiusCheckout";

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingDisplayName, setSavingDisplayName] = useState(false);
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

      // Fetch user credits/premium status
      if (session.user) {
        const { data } = await supabase
          .from('user_credits')
          .select('is_premium, premium_since, subscription_end_date, next_payment_date, auto_renew')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setCredits(data);

        // Fetch display name from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (profileData?.display_name) {
          setDisplayName(profileData.display_name);
        }
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

  const handleSaveDisplayName = async () => {
    if (!user) return;
    
    setSavingDisplayName(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim().slice(0, 30) })
      .eq('id', user.id);
    
    setSavingDisplayName(false);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to save display name.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved",
        description: "Your display name has been updated.",
      });
    }
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
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter a display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 30))}
                    maxLength={30}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveDisplayName}
                    disabled={savingDisplayName}
                    size="sm"
                  >
                    {savingDisplayName ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Display name for your account ({displayName.length}/30)
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
