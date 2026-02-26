import { Link } from 'react-router-dom';
import type { StreakData } from '@/types/gamification';

interface StreakBadgeProps {
  streak: StreakData | null;
  userId: string | null;
}

export function StreakBadge({ streak, userId }: StreakBadgeProps) {
  const currentStreak = streak?.current_streak ?? 0;

  return (
    <Link
      to="/dashboard"
      className={`group relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300
        border
        ${currentStreak > 0
          ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10'
          : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:border-border'
        }
      `}
      aria-label={`Streak: ${currentStreak} days`}
    >
      {/* Pulsing dot indicator */}
      <span className="relative flex h-2.5 w-2.5">
        {currentStreak > 0 && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentStreak > 0 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
      </span>
      <span className="relative font-mono tabular-nums">{currentStreak}</span>
      <span className="relative text-xs font-normal opacity-60 hidden sm:inline">day streak</span>
    </Link>
  );
}
