import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import type { StreakData } from '@/types/gamification';

export function useStreak(userId: string | null) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateStreak = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)('update_user_streak', {
        _user_id: userId,
      });
      if (error) {
        console.error('Streak update failed:', error);
        // Fallback: try to read existing streak
        const { data: fallback } = await supabase
          .from('user_streaks' as any)
          .select('current_streak, longest_streak, last_active_date, total_active_days')
          .eq('user_id', userId)
          .single();
        if (fallback) setStreak(fallback as unknown as StreakData);
      } else if (data) {
        setStreak(data as unknown as StreakData);
      }
    } catch (err) {
      console.error('Streak error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchStreak = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('user_streaks' as any)
        .select('current_streak, longest_streak, last_active_date, total_active_days')
        .eq('user_id', userId)
        .single();
      if (data) setStreak(data as unknown as StreakData);
    } catch (err) {
      console.error('Fetch streak error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      updateStreak();
    } else {
      setStreak(null);
    }
  }, [userId, updateStreak]);

  return { streak, isLoading, updateStreak, fetchStreak };
}
