import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase/external-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const returnTo = searchParams.get("returnTo");

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          toast.error("Authentication failed");
          navigate("/auth");
          return;
        }

        const user = session.user;
        const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
        const isNewUser = accountAge < 10000;

        // Run deletion block check and pending premium check in parallel
        const [deletionBlockResult, pendingPremiumResult] = await Promise.all([
          isNewUser 
            ? supabase.functions.invoke('check-deleted-account-block', { body: { email: user.email } })
            : Promise.resolve({ data: null, error: null }),
          supabase.from('pending_premium').select('*').ilike('email', user.email!).maybeSingle()
        ]);

        // Handle deletion block (only for new users)
        if (isNewUser && deletionBlockResult.data?.blocked) {
          console.log("Email blocked due to recent deletion, removing newly created account");
          
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
          
          const { error: activateError } = await supabase
            .from('user_credits')
            .upsert({
              user_id: user.id,
              is_premium: true,
              premium_since: new Date().toISOString(),
              freemius_subscription_id: pendingPremium.freemius_subscription_id,
              freemius_customer_id: pendingPremium.freemius_customer_id,
              subscription_end_date: (pendingPremium as any).subscription_end_date || null,
              auto_renew: (pendingPremium as any).auto_renew ?? true,
              next_payment_date: (pendingPremium as any).next_payment_date || null,
            }, { onConflict: 'user_id' });

          if (activateError) {
            console.error('Failed to activate premium:', activateError);
          } else {
            await supabase
              .from('pending_premium')
              .delete()
              .eq('id', pendingPremium.id);
            
            toast.success('Premium status activated!', { duration: 5000 });
          }
        }

        // Priority 1: Check for returnTo URL parameter
        if (returnTo) {
          toast.success("Successfully signed in!");
          navigate(returnTo);
          return;
        }

        // Check for stored intent
        const storedIntent = localStorage.getItem('auth_intent');
        localStorage.removeItem('auth_intent');
        
        if (isNewUser && storedIntent !== 'premium') {
          toast.success("Welcome to Synvertas!");
          navigate('/');
        } else if (storedIntent === 'premium') {
          const checkoutUrl = `https://checkout.freemius.com/product/21730/plan/36437/?user_email=${encodeURIComponent(user.email || '')}&readonly_user=true`;
          window.open(checkoutUrl, '_blank');
          toast.success(isNewUser ? "Welcome! Your Premium checkout is ready." : "Successfully signed in!");
          navigate('/profile');
        } else {
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
  }, [navigate, searchParams]);

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
