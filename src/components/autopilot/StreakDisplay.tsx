import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StreakDisplayProps {
  streak: number;
  longestStreak: number;
}

const StreakDisplay = ({ streak, longestStreak }: StreakDisplayProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            <span className="font-semibold text-sm">{streak}</span>
            <span className="text-xs">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">Current streak: {streak} days</p>
            {longestStreak > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Best: {longestStreak} days
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakDisplay;
