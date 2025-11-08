import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          toast.error("Authentifizierung fehlgeschlagen");
          navigate("/auth");
          return;
        }

        const user = session.user;
        const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
        const isNewUser = accountAge < 10000; // Less than 10 seconds old

        if (isNewUser) {
          // Check if email is blocked (24h hash ban)
          const { data, error } = await supabase.functions.invoke('check-email-availability', {
            body: { email: user.email }
          });

          if (error) {
            console.error("Email check error:", error);
            // Fail-open: allow registration if check fails
            navigate("/");
            return;
          }

          if (!data.available) {
            // Email is blocked - delete the just-created account
            await supabase.auth.signOut();
            
            const hoursRemaining = data.reason?.match(/(\d+)/)?.[1] || "24";
            toast.error(
              `Diese Email-Adresse kann für weitere ${hoursRemaining} Stunden nicht verwendet werden.`,
              { duration: 6000 }
            );
            navigate("/auth");
            return;
          }
        }

        // All checks passed or existing user - redirect to home
        toast.success("Erfolgreich angemeldet!");
        navigate("/");
        
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
        navigate("/auth");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Authentifizierung wird verarbeitet...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
