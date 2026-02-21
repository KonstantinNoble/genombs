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
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-secondary ${
        currentStreak > 0 
          ? 'text-primary' 
          : 'text-muted-foreground'
      } ${isNewRecord ? 'animate-pulse-subtle' : ''}`}
      aria-label={`Streak: ${currentStreak} days`}
    >
      <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
      <span>{currentStreak}</span>
    </Link>
  );
}
