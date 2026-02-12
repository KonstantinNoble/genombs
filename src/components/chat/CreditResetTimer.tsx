import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditResetTimerProps {
  creditsResetAt: string | null;
}

const CreditResetTimer = ({ creditsResetAt }: CreditResetTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!creditsResetAt) {
      setTimeLeft("");
      return;
    }

    const update = () => {
      const now = Date.now();
      const resetTime = new Date(creditsResetAt).getTime();
      const diff = resetTime - now;

      if (diff <= 0) {
        setTimeLeft("now");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [creditsResetAt]);

  if (!creditsResetAt || !timeLeft) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-default">
            <Clock className="w-3 h-3" />
            <span>{timeLeft}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Credits reset in {timeLeft}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CreditResetTimer;
