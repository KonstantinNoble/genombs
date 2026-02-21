import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/external-client';
import { BADGE_DEFINITIONS } from '@/lib/badges';
import { Zap, Flame, Trophy, Crown, Star, CheckCircle, BarChart, Lock } from 'lucide-react';
import type { UserBadge } from '@/types/gamification';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Flame, Trophy, Crown, Star, CheckCircle, BarChart,
};

interface BadgeGalleryProps {
  userId: string | null;
}

export function BadgeGallery({ userId }: BadgeGalleryProps) {
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges' as any)
        .select('badge_id')
        .eq('user_id', userId);
      if (data) {
        setUnlockedBadges(new Set((data as any[]).map(b => b.badge_id)));
      }
    };
    fetchBadges();
  }, [userId]);

  return (
    <div className="p-4">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Badges
      </h4>
      <div className="grid grid-cols-4 gap-3">
        {BADGE_DEFINITIONS.map(badge => {
          const isUnlocked = unlockedBadges.has(badge.id);
          const Icon = ICON_MAP[badge.icon] || Zap;

          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1.5 group"
              title={isUnlocked ? badge.description : badge.condition}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isUnlocked
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground/40'
              }`}>
                {isUnlocked ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <span className={`text-[10px] text-center leading-tight ${
                isUnlocked ? 'text-foreground' : 'text-muted-foreground/50'
              }`}>
                {badge.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
