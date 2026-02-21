/**
 * Hook that triggers all gamification side-effects after an analysis completes:
 * 1. Updates the user's streak
 * 2. Generates daily tasks from category scores
 * 3. Checks and unlocks badges
 */
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { useStreak } from '@/hooks/useStreak';
import { useBadgeChecker } from '@/hooks/useBadgeChecker';
import { generateTasksFromScores } from '@/lib/task-generator';
import type { WebsiteProfile } from '@/types/chat';

export function useGamificationTrigger(userId: string | null) {
  const { streak, updateStreak } = useStreak(userId, true);
  const { checkAndUnlockBadges } = useBadgeChecker(userId);

  const triggerAfterAnalysis = useCallback(async (completedProfiles: WebsiteProfile[]) => {
    if (!userId || completedProfiles.length === 0) return;

    try {
      // 1. Update streak (marks today as active)
      await updateStreak();

      // 2. Generate daily tasks from the own-website's category_scores
      const ownProfile = completedProfiles.find(p => p.is_own_website);
      if (ownProfile?.category_scores) {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if tasks already exist for today
        const { data: existingTasks } = await supabase
          .from('daily_tasks' as any)
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', today)
          .lt('created_at', today + 'T23:59:59.999Z');

        if (!existingTasks || existingTasks.length === 0) {
          const scores = ownProfile.category_scores as unknown as Record<string, number>;
          const newTasks = generateTasksFromScores(scores);
          
          if (newTasks.length > 0) {
            const inserts = newTasks.map(t => ({
              user_id: userId,
              website_profile_id: ownProfile.id,
              task_text: t.task_text,
              category: t.category,
              completed: false,
            }));

            const { error } = await supabase
              .from('daily_tasks' as any)
              .insert(inserts);
            
            if (error) console.error('Task insert error:', error);
          }
        }
      }

      // 3. Build badge context and check
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

      const { count: completedTasksCount } = await supabase
        .from('daily_tasks' as any)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true);

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
        completedTasksCount: completedTasksCount ?? 0,
      });
    } catch (err) {
      console.error('Gamification trigger error:', err);
    }
  }, [userId, updateStreak, checkAndUnlockBadges]);

  return { triggerAfterAnalysis, streak };
}
