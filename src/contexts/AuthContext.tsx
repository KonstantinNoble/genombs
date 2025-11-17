import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  isPremium: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPremium: false,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('user_credits')
              .select('is_premium, subscription_end_date, auto_renew')
              .eq('user_id', session.user.id)
              .single();
            
            let actualPremiumStatus = data?.is_premium ?? false;
            
            // Fallback check: If subscription was cancelled
            if (actualPremiumStatus && data?.auto_renew === false) {
              if (data?.subscription_end_date) {
                // Case 1: End date exists -> Check if it's in the past
                const endDate = new Date(data.subscription_end_date);
                if (endDate < new Date()) {
                  actualPremiumStatus = false;
                }
              } else {
                // Case 2: No end date but subscription cancelled -> Treat as expired
                actualPremiumStatus = false;
              }
            }
            
            setIsPremium(actualPremiumStatus);
          } catch (error) {
            console.error('Premium check failed:', error);
            setIsPremium(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const { data } = await supabase
              .from('user_credits')
              .select('is_premium, subscription_end_date, auto_renew')
              .eq('user_id', session.user.id)
              .single();
            
            let actualPremiumStatus = data?.is_premium ?? false;
            
            // Fallback check: If subscription was cancelled
            if (actualPremiumStatus && data?.auto_renew === false) {
              if (data?.subscription_end_date) {
                // Case 1: End date exists -> Check if it's in the past
                const endDate = new Date(data.subscription_end_date);
                if (endDate < new Date()) {
                  actualPremiumStatus = false;
                }
              } else {
                // Case 2: No end date but subscription cancelled -> Treat as expired
                actualPremiumStatus = false;
              }
            }
            
            setIsPremium(actualPremiumStatus);
          } catch (error) {
            console.error('Premium check failed:', error);
            setIsPremium(false);
          }
        }, 0);
      } else {
        setIsPremium(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, isPremium, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
