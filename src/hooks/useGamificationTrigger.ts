/**
 * Hook that triggers all gamification side-effects after an analysis completes:
 * 1. Updates the user's streak
 * 2. Checks and unlocks badges
 */
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { useStreak } from '@/hooks/useStreak';
import { useBadgeChecker } from '@/hooks/useBadgeChecker';
import type { WebsiteProfile } from '@/types/chat';

export function useGamificationTrigger(userId: string | null) {
  const { streak, updateStreak } = useStreak(userId, true);
  const { checkAndUnlockBadges } = useBadgeChecker(userId);

  const triggerAfterAnalysis = useCallback(async (completedProfiles: WebsiteProfile[]) => {
    if (!userId || completedProfiles.length === 0) return;

    try {
      // 1. Update streak (marks today as active)
      await updateStreak();

      // 2. Build badge context and check
      const { count: scanCount } = await supabase
        .from('website_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      const { data: scoreData } = await supabase
        .from('website_profiles')
        .select('overall_score')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('overall_score', { ascending: false })
        .limit(1);

      // Re-fetch streak after update
      const { data: freshStreak } = await supabase
        .from('user_streaks' as any)
        .select('current_streak, longest_streak, last_active_date, total_active_days')
        .eq('user_id', userId)
        .single();

      await checkAndUnlockBadges({
        scanCount: scanCount ?? 0,
        highestScore: scoreData?.[0]?.overall_score ?? 0,
        streak: freshStreak as any,
      });
    } catch (err) {
      console.error('Gamification trigger error:', err);
    }
  }, [userId, updateStreak, checkAndUnlockBadges]);

  return { triggerAfterAnalysis, streak };
}
