import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

const SyncUsersToResend = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndCountUsers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Nicht authentifiziert",
            description: "Bitte melden Sie sich an.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data: isAdmin } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });

        if (!isAdmin) {
          toast({
            title: "Zugriff verweigert",
            description: "Diese Seite ist nur für Administratoren zugänglich.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Count users
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        setUserCount(count || 0);
        setIsCheckingAdmin(false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Fehler",
          description: "Zugriffsprüfung fehlgeschlagen.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminAndCountUsers();
  }, [navigate, toast]);

  const handleSyncUsers = async () => {
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Nicht authentifiziert",
          description: "Bitte melden Sie sich an.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Fetch all user emails
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('email')
        .not('email', 'is', null);

      if (fetchError) throw fetchError;

      if (!profiles || profiles.length === 0) {
        toast({
          title: "Keine Nutzer gefunden",
          description: "Es gibt keine Nutzer zum Synchronisieren.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sync each user to Resend
      let successCount = 0;
      let errorCount = 0;

      for (const profile of profiles) {
        try {
          const response = await fetch(
            `https://fdlyaasqywmdinyaivmw.supabase.co/functions/v1/sync-user-to-resend`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: profile.email }),
            }
          );

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      toast({
        title: "✅ Synchronisation abgeschlossen",
        description: `${successCount} Nutzer erfolgreich synchronisiert${errorCount > 0 ? `, ${errorCount} Fehler` : ''}.`,
      });

    } catch (error: any) {
      console.error("Error syncing users:", error);
      toast({
        title: "Fehler bei Synchronisation",
        description: error.message || "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-6 w-6" />
              Nutzer zu Resend synchronisieren
            </CardTitle>
            <CardDescription>
              Synchronisiere alle bestehenden Nutzer einmalig zur Resend Audience
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">📊 Status:</h4>
              <p className="text-sm">
                <strong>Registrierte Nutzer:</strong> {userCount}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Neue Nutzer werden automatisch synchronisiert. Diese Aktion ist nur für bestehende Nutzer nötig.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ Wichtig:
              </h4>
              <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                <li>Diese Aktion synchronisiert alle {userCount} Nutzer zur Resend Audience</li>
                <li>Bereits vorhandene Kontakte werden übersprungen (kein Fehler)</li>
                <li>Der Vorgang kann je nach Nutzerzahl einige Sekunden dauern</li>
              </ul>
            </div>

            <Button
              onClick={handleSyncUsers}
              disabled={isLoading || userCount === 0}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronisiere {userCount} Nutzer...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Alle Nutzer jetzt synchronisieren
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Nach erfolgreicher Synchronisation kannst du Broadcasts direkt in Resend versenden.
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SyncUsersToResend;
