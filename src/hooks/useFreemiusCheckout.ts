import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FREEMIUS_CONFIG = {
  product_id: '21730',
  plan_id: '36437',
  public_key: 'pk_b23a145b951f7f5061c85524f0fdc',
  image: 'https://synoptas.com/favicon.png'
};

export const useFreemiusCheckout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.FS) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.freemius.com/js/v1/';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);
  }, []);

  const openCheckout = useCallback((email?: string) => {
    if (!isLoaded || !window.FS) {
      toast({
        title: "Loading...",
        description: "Please wait while checkout loads.",
      });
      return;
    }

    setIsLoading(true);

    const handler = new window.FS.Checkout(FREEMIUS_CONFIG);

    const userEmail = email || user?.email;

    handler.open({
      name: 'Synoptas Premium',
      licenses: 1,
      ...(userEmail && { 
        user_email: userEmail,
        readonly_user: true 
      }),
      
      purchaseCompleted: async (response) => {
        console.log('Purchase completed:', response);
        
        try {
          await supabase.functions.invoke('sync-freemius-subscription');
          toast({
            title: "Welcome to Premium!",
            description: "Your account has been upgraded successfully.",
          });
          window.location.reload();
        } catch (error) {
          console.error('Failed to sync subscription:', error);
        }
        
        setIsLoading(false);
      },
      
      success: (response) => {
        console.log('Checkout closed after success:', response);
        setIsLoading(false);
      },
      
      cancel: () => {
        console.log('Checkout cancelled');
        setIsLoading(false);
      }
    });
  }, [isLoaded, user, toast]);

  return { openCheckout, isLoaded, isLoading };
};
