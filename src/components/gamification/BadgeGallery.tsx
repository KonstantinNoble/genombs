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
  size?: 'sm' | 'lg';
}

export function BadgeGallery({ userId, size = 'sm' }: BadgeGalleryProps) {
  const [unlockedBadges, setUnlockedBadges] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!userId) return;
    const fetchBadges = async () => {
      const { data } = await supabase
        .from('user_badges' as any)
        .select('badge_id, unlocked_at')
        .eq('user_id', userId);
      if (data) {
        const map = new Map<string, string>();
        (data as any[]).forEach(b => map.set(b.badge_id, b.unlocked_at));
        setUnlockedBadges(map);
      }
    };
    fetchBadges();
  }, [userId]);

  const isLarge = size === 'lg';
  const iconSize = isLarge ? 'w-10 h-10' : 'w-5 h-5';
  const containerSize = isLarge ? 'w-20 h-20' : 'w-10 h-10';
  const lockSize = isLarge ? 'w-6 h-6' : 'w-4 h-4';
  const nameClass = isLarge ? 'text-sm font-medium' : 'text-[10px]';
  const gridCols = isLarge ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6' : 'grid-cols-4 gap-3';

  return (
    <div className={isLarge ? '' : 'p-4'}>
      {!isLarge && (
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Badges
        </h4>
      )}
      <div className={`grid ${gridCols}`}>
        {BADGE_DEFINITIONS.map(badge => {
          const unlockedAt = unlockedBadges.get(badge.id);
          const isUnlocked = !!unlockedAt;
          const Icon = ICON_MAP[badge.icon] || Zap;

          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 group ${isLarge ? 'p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors' : ''}`}
            >
              <div className={`${containerSize} rounded-full flex items-center justify-center transition-all duration-200 ${
                isUnlocked
                  ? 'bg-primary/15 text-primary'
                  : 'bg-secondary text-muted-foreground/40'
              }`}>
                {isUnlocked ? (
                  <Icon className={iconSize} />
                ) : (
                  <Lock className={lockSize} />
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className={`${nameClass} text-center leading-tight ${
                  isUnlocked ? 'text-foreground' : 'text-muted-foreground/50'
                }`}>
                  {badge.name}
                </span>
                {isLarge && (
                  <>
                    <span className="text-xs text-muted-foreground text-center">
                      {isUnlocked ? badge.description : badge.condition}
                    </span>
                    {isUnlocked && unlockedAt && (
                      <span className="text-[10px] text-primary mt-1">
                        {new Date(unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
