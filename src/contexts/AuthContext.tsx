import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  isPremium: boolean;
  isLoading: boolean;
  creditsUsed: number;
  creditsLimit: number;
  creditsResetAt: string | null;
  remainingCredits: number;
  refreshCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isPremium: false,
  isLoading: true,
  creditsUsed: 0,
  creditsLimit: 20,
  creditsResetAt: null,
  remainingCredits: 20,
  refreshCredits: async () => {},
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
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsLimit, setCreditsLimit] = useState(20);
  const [creditsResetAt, setCreditsResetAt] = useState<string | null>(null);

  // Helper function to calculate actual premium status
  const calculatePremiumStatus = useCallback((data: { 
    is_premium?: boolean | null; 
    subscription_end_date?: string | null; 
    auto_renew?: boolean | null;
  } | null): boolean => {
    if (!data) return false;
    
    let actualPremiumStatus = data.is_premium ?? false;
    
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

  const updateCreditsFromData = useCallback((data: {
    credits_used?: number | null;
    daily_credits_limit?: number | null;
    credits_reset_at?: string | null;
  } | null) => {
    if (!data) return;
    // Auto-reset if period expired
    const resetAt = data.credits_reset_at ? new Date(data.credits_reset_at) : null;
    if (resetAt && resetAt < new Date()) {
      setCreditsUsed(0);
    } else {
      setCreditsUsed(data.credits_used ?? 0);
    }
    setCreditsLimit(data.daily_credits_limit ?? 20);
    setCreditsResetAt(data.credits_reset_at ?? null);
  }, []);

  const refreshCredits = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_credits')
        .select('credits_used, daily_credits_limit, credits_reset_at')
        .eq('user_id', user.id)
        .single();
      updateCreditsFromData(data);
    } catch (error) {
      console.error('Failed to refresh credits:', error);
    }
  }, [user, updateCreditsFromData]);

  // Realtime subscription for credit changes
  useEffect(() => {
    if (!user) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`user_credits_${user.id}`)
        .on<{ is_premium: boolean; subscription_end_date: string | null; auto_renew: boolean | null; credits_used: number; daily_credits_limit: number; credits_reset_at: string }>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${user.id}`
          },
          (payload: RealtimePostgresUpdatePayload<{ is_premium: boolean; subscription_end_date: string | null; auto_renew: boolean | null; credits_used: number; daily_credits_limit: number; credits_reset_at: string }>) => {
            console.log('Realtime credits update:', payload.new);
            const newPremiumStatus = calculatePremiumStatus(payload.new);
            setIsPremium(newPremiumStatus);
            updateCreditsFromData(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Realtime channel error - updates may be delayed');
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
  }, [user, calculatePremiumStatus, updateCreditsFromData]);

  // Polling fallback for credit refresh (every 30s)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshCredits();
    }, 30000);
    return () => clearInterval(interval);
  }, [user, refreshCredits]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          10000
        );
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const creditsQuery = supabase
              .from('user_credits')
              .select('is_premium, subscription_end_date, auto_renew, credits_used, daily_credits_limit, credits_reset_at')
              .eq('user_id', session.user.id)
              .single();
            
            const { data } = await withTimeout(
              Promise.resolve(creditsQuery),
              8000
            );
            
            setIsPremium(calculatePremiumStatus(data));
            updateCreditsFromData(data);
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
              .select('is_premium, subscription_end_date, auto_renew, credits_used, daily_credits_limit, credits_reset_at')
              .eq('user_id', session.user.id)
              .single();
            
            const { data } = await withTimeout(
              Promise.resolve(creditsQuery),
              8000
            );
            
            setIsPremium(calculatePremiumStatus(data));
            updateCreditsFromData(data);
          } catch (error) {
            console.error('Premium check failed:', error);
            setIsPremium(false);
          }
        }, 0);
      } else {
        setIsPremium(false);
        setCreditsUsed(0);
        setCreditsLimit(20);
        setCreditsResetAt(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const remainingCredits = Math.max(0, creditsLimit - creditsUsed);
  
  return (
    <AuthContext.Provider value={{ user, isPremium, isLoading, creditsUsed, creditsLimit, creditsResetAt, remainingCredits, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  );
};
