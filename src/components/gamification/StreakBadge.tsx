import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BadgeGallery } from './BadgeGallery';
import type { StreakData } from '@/types/gamification';

interface StreakBadgeProps {
  streak: StreakData | null;
  userId: string | null;
}

export function StreakBadge({ streak, userId }: StreakBadgeProps) {
  const [open, setOpen] = useState(false);
  const currentStreak = streak?.current_streak ?? 0;
  const isNewRecord = streak && streak.current_streak === streak.longest_streak && streak.current_streak > 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:bg-secondary ${
            currentStreak > 0 
              ? 'text-primary' 
              : 'text-muted-foreground'
          } ${isNewRecord ? 'animate-pulse-subtle' : ''}`}
          aria-label={`Streak: ${currentStreak} Tage`}
        >
          <Flame className={`w-4 h-4 ${currentStreak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          <span>{currentStreak}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">
              {currentStreak}-Tage-Streak
            </span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Rekord: {streak?.longest_streak ?? 0} Tage</span>
            <span>Gesamt: {streak?.total_active_days ?? 0} Tage aktiv</span>
          </div>
        </div>
        <BadgeGallery userId={userId} />
      </PopoverContent>
    </Popover>
  );
}
