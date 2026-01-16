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
          // Check ONLY for 24h deletion block (no rate limiting, no other checks)
          const { data, error } = await supabase.functions.invoke('check-deleted-account-block', {
            body: { email: user.email }
          });

          if (error) {
            console.error("Deletion block check error:", error);
            // Fail-open: allow registration if check fails
          } else if (data?.blocked) {
            // Email is actually blocked due to recent account deletion
            console.log("Email blocked due to recent deletion, removing newly created account");
            
            // Call edge function to delete the blocked account
            const { error: deleteError } = await supabase.functions.invoke('delete-blocked-account');
            
            if (deleteError) {
              console.error("Failed to delete blocked account:", deleteError);
            }
            
            // Use the message directly from backend
            toast.error(
              data.message || `This email address cannot be used for another ${data.hoursRemaining || 24} hours.`,
              { duration: 8000 }
            );
            navigate("/auth");
            return;
          }
          // If not blocked, continue with normal flow
        }

        // Check for pending premium activation
        const { data: pendingPremium, error: pendingError } = await supabase
          .from('pending_premium')
          .select('*')
          .ilike('email', user.email!)
          .maybeSingle();

        if (!pendingError && pendingPremium) {
          console.log('Found pending premium for user, activating...');
          
          // Activate premium in user_credits mit allen Subscription-Feldern
          const { error: activateError } = await supabase
            .from('user_credits')
            .upsert({
              user_id: user.id,
              is_premium: true,
              premium_since: new Date().toISOString(),
              freemius_subscription_id: pendingPremium.freemius_subscription_id,
              freemius_customer_id: pendingPremium.freemius_customer_id,
              // NEU: Übertrage alle Subscription-Felder aus pending_premium
              subscription_end_date: (pendingPremium as any).subscription_end_date || null,
              auto_renew: (pendingPremium as any).auto_renew ?? true,
              next_payment_date: (pendingPremium as any).next_payment_date || null,
            }, { onConflict: 'user_id' });

          if (activateError) {
            console.error('Failed to activate premium:', activateError);
          } else {
            // Delete from pending_premium
            await supabase
              .from('pending_premium')
              .delete()
              .eq('id', pendingPremium.id);
            
            toast.success('Premium status activated!', { duration: 5000 });
          }
        }

        // Check for stored intent
        const storedIntent = localStorage.getItem('auth_intent');
        localStorage.removeItem('auth_intent');
        
        // Neue User direkt zum Strategy Planner leiten (außer bei Premium-Intent)
        if (isNewUser && storedIntent !== 'premium') {
          toast.success("Welcome! Let's create your first strategy.");
          navigate('/business-tools');
        } else if (storedIntent === 'premium') {
          // Premium-Intent (auch für neue User) -> Checkout öffnen
          const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user.email}&readonly_user=true`;
          window.open(checkoutUrl, '_blank');
          toast.success(isNewUser ? "Welcome! Your Premium checkout is ready." : "Successfully signed in!");
          navigate('/profile');
        } else if (storedIntent === 'free') {
          toast.success("Successfully signed in!");
          navigate('/business-tools');
        } else {
          // Existing user without intent - redirect to home
          toast.success("Successfully signed in!");
          navigate("/");
        }
        
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
