import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhopMembershipData {
  isPremium: boolean;
  isLoading: boolean;
  membershipStatus: 'active' | 'cancelled' | 'expired' | 'paused' | null;
  validUntil: string | null;
  planId: string | null;
}

export function useWhopMembership(): WhopMembershipData {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<'active' | 'cancelled' | 'expired' | 'paused' | null>(null);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const fetchPremiumStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch premium status from user_credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('user_credits')
          .select('is_premium, premium_source')
          .eq('user_id', user.id)
          .maybeSingle();

        if (creditsError) {
          console.error('Error fetching premium status:', creditsError);
          setIsLoading(false);
          return;
        }

        if (mounted) {
          setIsPremium(creditsData?.is_premium || false);
        }

        // Fetch membership details if premium
        if (creditsData?.is_premium && creditsData?.premium_source === 'whop') {
          const { data: membershipData, error: membershipError } = await supabase
            .from('whop_memberships')
            .select('status, valid_until, plan_id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (membershipError) {
            console.error('Error fetching membership:', membershipError);
          } else if (membershipData && mounted) {
            setMembershipStatus(membershipData.status as any);
            setValidUntil(membershipData.valid_until);
            setPlanId(membershipData.plan_id);
          }
        }
      } catch (error) {
        console.error('Error in useWhopMembership:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPremiumStatus();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('premium-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_credits',
          filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
        },
        (payload) => {
          console.log('Premium status changed:', payload);
          if (mounted) {
            fetchPremiumStatus();
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, []);

  return {
    isPremium,
    isLoading,
    membershipStatus,
    validUntil,
    planId,
  };
}
