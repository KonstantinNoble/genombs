import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

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

// Timeout wrapper for async operations
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), ms);
  });
  return Promise.race([promise, timeout]);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to calculate actual premium status
  const calculatePremiumStatus = useCallback((data: { 
    is_premium?: boolean | null; 
    subscription_end_date?: string | null; 
    auto_renew?: boolean | null;
  } | null): boolean => {
    if (!data) return false;
    
    let actualPremiumStatus = data.is_premium ?? false;
    
    // Fallback check: If subscription was cancelled
    if (actualPremiumStatus && data.auto_renew === false) {
      if (data.subscription_end_date) {
        const endDate = new Date(data.subscription_end_date);
        if (endDate < new Date()) {
          actualPremiumStatus = false;
        }
      } else {
        actualPremiumStatus = false;
      }
    }
    
    return actualPremiumStatus;
  }, []);

  // Realtime subscription for premium status changes
  useEffect(() => {
    if (!user) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`user_credits_${user.id}`)
        .on<{ is_premium: boolean; subscription_end_date: string | null; auto_renew: boolean | null }>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${user.id}`
          },
          (payload: RealtimePostgresUpdatePayload<{ is_premium: boolean; subscription_end_date: string | null; auto_renew: boolean | null }>) => {
            console.log('Realtime premium status update:', payload.new);
            const newPremiumStatus = calculatePremiumStatus(payload.new);
            setIsPremium(newPremiumStatus);
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime channel error - premium updates may be delayed');
          }
        });
    } catch (error) {
      console.error('Failed to setup realtime subscription:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel:', error);
        }
      }
    };
  }, [user, calculatePremiumStatus]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          10000 // 10 second timeout
        );
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const creditsQuery = supabase
              .from('user_credits')
              .select('is_premium, subscription_end_date, auto_renew')
              .eq('user_id', session.user.id)
              .single();
            
            const { data } = await withTimeout(
              Promise.resolve(creditsQuery),
              8000 // 8 second timeout
            );
            
            setIsPremium(calculatePremiumStatus(data));
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
            const creditsQuery = supabase
              .from('user_credits')
              .select('is_premium, subscription_end_date, auto_renew')
              .eq('user_id', session.user.id)
              .single();
            
            const { data } = await withTimeout(
              Promise.resolve(creditsQuery),
              8000
            );
            
            setIsPremium(calculatePremiumStatus(data));
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
