import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface ScanLimitBarProps {
  used: number;
  total: number;
  isPremium: boolean;
}

const ScanLimitBar = ({ used, total, isPremium }: ScanLimitBarProps) => {
  if (isPremium) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-foreground font-medium">Unlimited Analyses</span>
        <span>– Premium Plan</span>
      </div>
    );
  }

  const percentage = (used / total) * 100;
  const isNearLimit = used >= total - 1;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className={`font-medium ${isNearLimit ? "text-primary" : "text-foreground"}`}>
            {used}
          </span>{" "}
          of {total} analyses this month
        </span>
        {used >= total && (
          <span className="text-xs text-primary font-medium">Limit reached</span>
        )}
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ScanLimitBar;
