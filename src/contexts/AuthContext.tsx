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
              .select('is_premium')
              .eq('user_id', session.user.id)
              .single();
            setIsPremium(data?.is_premium ?? false);
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
              .select('is_premium')
              .eq('user_id', session.user.id)
              .single();
            setIsPremium(data?.is_premium ?? false);
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
