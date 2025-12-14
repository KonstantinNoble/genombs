import { Flame, Trophy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakDisplayProps {
  streak: number;
  longestStreak: number;
}

const StreakDisplay = ({ streak, longestStreak }: StreakDisplayProps) => {
  const getStreakMessage = () => {
    if (streak === 0) return "Starte deinen Streak!";
    if (streak >= 30) return "Legendär! 🏆";
    if (streak >= 14) return "Unaufhaltsam! 💪";
    if (streak >= 7) return "Eine Woche stark! 🌟";
    if (streak >= 3) return "Du bist dran! 🔥";
    return "Weiter so!";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full">
            <Flame className="h-4 w-4" />
            <span className="font-semibold text-sm">{streak}</span>
            <span className="text-xs hidden sm:inline">Day{streak !== 1 ? 's' : ''}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{getStreakMessage()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aktueller Streak: {streak} Tage
            </p>
            {longestStreak > 0 && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Trophy className="h-3 w-3" />
                Bester Streak: {longestStreak} Tage
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakDisplay;
