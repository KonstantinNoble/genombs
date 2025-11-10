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
          toast.error("Authentication failed");
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
            // Email is blocked - delete the just-created account properly
            console.log("Email blocked, deleting newly created account");
            
            // Call edge function to delete the blocked account
            const { error: deleteError } = await supabase.functions.invoke('delete-blocked-account');
            
            if (deleteError) {
              console.error("Failed to delete blocked account:", deleteError);
            }
            
            const hoursRemaining = data.reason?.match(/(\d+)/)?.[1] || "24";
            toast.error(
              `This email address cannot be used for another ${hoursRemaining} hours.`,
              { duration: 6000 }
            );
            navigate("/auth");
            return;
          }
        }

        // Check for pending premium activation
        const { data: pendingPremium, error: pendingError } = await supabase
          .from('pending_premium')
          .select('*')
          .ilike('email', user.email!)
          .maybeSingle();

        if (!pendingError && pendingPremium) {
          console.log('Found pending premium for user, activating...');
          
          // Activate premium in user_credits
          const { error: activateError } = await supabase
            .from('user_credits')
            .upsert({
              user_id: user.id,
              is_premium: true,
              premium_since: new Date().toISOString(),
              freemius_subscription_id: pendingPremium.freemius_subscription_id,
              freemius_customer_id: pendingPremium.freemius_customer_id,
            }, { onConflict: 'user_id' });

          if (activateError) {
            console.error('Failed to activate premium:', activateError);
          } else {
            // Delete from pending_premium
            await supabase
              .from('pending_premium')
              .delete()
              .eq('id', pendingPremium.id);
            
            toast.success('Premium status activated! 🎉', { duration: 5000 });
          }
        }

        // All checks passed or existing user - redirect to home
        toast.success("Successfully signed in!");
        navigate("/");
        
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("An error occurred. Please try again.");
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
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
