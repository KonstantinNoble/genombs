import { useCallback } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import type { UserBadge, StreakData } from '@/types/gamification';
import { toast } from 'sonner';

const BADGE_ICON_MAP: Record<string, string> = {
  'Zap': '⚡',
  'Flame': '🔥',
  'Trophy': '🏆',
  'Crown': '👑',
  'Star': '⭐',
  'BarChart': '📊',
};

export function useBadgeChecker(userId: string | null) {
  const checkAndUnlockBadges = useCallback(async (context: {
    streak?: StreakData | null;
    scanCount?: number;
    highestScore?: number;
  }) => {
    if (!userId) return;

    try {
      // Fetch already unlocked badges
      const { data: existing } = await supabase
        .from('user_badges' as any)
        .select('badge_id')
        .eq('user_id', userId);

      const unlockedIds = new Set((existing || []).map((b: any) => b.badge_id));
      const newBadges: string[] = [];

      // Check each badge condition
      for (const badge of BADGE_DEFINITIONS) {
        if (unlockedIds.has(badge.id)) continue;

        let earned = false;

        switch (badge.id) {
          case 'first_scan':
            earned = (context.scanCount ?? 0) >= 1;
            break;
          case 'streak_3':
            earned = (context.streak?.current_streak ?? 0) >= 3;
            break;
          case 'streak_7':
            earned = (context.streak?.current_streak ?? 0) >= 7;
            break;
          case 'streak_30':
            earned = (context.streak?.current_streak ?? 0) >= 30;
            break;
          case 'score_80':
            earned = (context.highestScore ?? 0) >= 80;
            break;
          case 'scans_5':
            earned = (context.scanCount ?? 0) >= 5;
            break;
        }

        if (earned) {
          newBadges.push(badge.id);
        }
      }

      // Insert new badges
      if (newBadges.length > 0) {
        const inserts = newBadges.map(badgeId => ({
          user_id: userId,
          badge_id: badgeId,
        }));

        const { error } = await supabase
          .from('user_badges' as any)
          .insert(inserts);

        if (error) {
          console.error('Badge insert error:', error);
          return;
        }

        // Show toast for each new badge
        for (const badgeId of newBadges) {
          const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
          if (def) {
            const emoji = BADGE_ICON_MAP[def.icon] || '🎖️';
            toast.success(`${emoji} Badge Unlocked: ${def.name}!`, {
              description: def.description,
              duration: 5000,
            });
          }
        }
      }
    } catch (err) {
      console.error('Badge check error:', err);
    }
  }, [userId]);

  return { checkAndUnlockBadges };
}
