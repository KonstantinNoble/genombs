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

        // Run deletion block check and pending premium check in parallel for speed
        const [deletionBlockResult, pendingPremiumResult] = await Promise.all([
          // Only check deletion block for new users
          isNewUser 
            ? supabase.functions.invoke('check-deleted-account-block', { body: { email: user.email } })
            : Promise.resolve({ data: null, error: null }),
          // Always check for pending premium
          supabase.from('pending_premium').select('*').ilike('email', user.email!).maybeSingle()
        ]);

        // Handle deletion block (only for new users)
        if (isNewUser && deletionBlockResult.data?.blocked) {
          console.log("Email blocked due to recent deletion, removing newly created account");
          
          // Call edge function to delete the blocked account
          const { error: deleteError } = await supabase.functions.invoke('delete-blocked-account');
          
          if (deleteError) {
            console.error("Failed to delete blocked account:", deleteError);
          }
          
          toast.error(
            deletionBlockResult.data.message || `This email address cannot be used for another ${deletionBlockResult.data.hoursRemaining || 24} hours.`,
            { duration: 8000 }
          );
          navigate("/auth");
          return;
        }

        // Extract pending premium data
        const pendingPremium = pendingPremiumResult.data;
        const pendingError = pendingPremiumResult.error;

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

        // Check for pending team invitation stored in sessionStorage
        const pendingInviteToken = localStorage.getItem('pending_team_invite');
        if (pendingInviteToken) {
          localStorage.removeItem('pending_team_invite');
          toast.success("Successfully signed in! Processing your team invitation...");
          navigate(`/team/invite/${pendingInviteToken}`);
          return;
        }

        // Check for stored intent
        const storedIntent = localStorage.getItem('auth_intent');
        localStorage.removeItem('auth_intent');
        
        // Neue User direkt zum Validator leiten (außer bei Premium-Intent)
        if (isNewUser && storedIntent !== 'premium') {
          toast.success("Welcome! Let's validate your first decision.");
          navigate('/validate');
        } else if (storedIntent === 'premium') {
          // Premium-Intent (auch für neue User) -> Checkout öffnen
          const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${user.email}&readonly_user=true`;
          window.open(checkoutUrl, '_blank');
          toast.success(isNewUser ? "Welcome! Your Premium checkout is ready." : "Successfully signed in!");
          navigate('/profile');
        } else if (storedIntent === 'free') {
          toast.success("Successfully signed in!");
          navigate('/validate');
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
