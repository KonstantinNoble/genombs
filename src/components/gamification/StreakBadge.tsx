import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import type { StreakData } from '@/types/gamification';

interface StreakBadgeProps {
  streak: StreakData | null;
  userId: string | null;
}

export function StreakBadge({ streak, userId }: StreakBadgeProps) {
  const currentStreak = streak?.current_streak ?? 0;
  const isNewRecord = streak && streak.current_streak === streak.longest_streak && streak.current_streak > 1;

  return (
    <Link
      to="/achievements"
      className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300
        border
        ${currentStreak > 0
          ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10'
          : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:border-border'
        }
        ${isNewRecord ? 'animate-pulse' : ''}
      `}
      aria-label={`Streak: ${currentStreak} days`}
    >
      {/* Glow behind the icon when streak is active */}
      {currentStreak > 0 && (
        <span className="absolute left-3 w-5 h-5 rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30 transition-colors" />
      )}
      <Flame
        className={`relative w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${currentStreak > 0 ? 'text-primary' : 'text-muted-foreground'
          }`}
      />
      <span className="relative tabular-nums">{currentStreak}</span>
      <span className="relative text-xs font-normal opacity-60 hidden sm:inline">day streak</span>
    </Link>
  );
}
