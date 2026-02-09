import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PremiumLock from "@/components/genome/PremiumLock";
import type { Optimization } from "@/lib/demo-data";

interface OptimizationCardProps {
  optimization: Optimization;
  isPremium?: boolean;
}

const priorityConfig = {
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  low: "bg-muted text-muted-foreground border-border",
};

const impactConfig = {
  high: "bg-primary/15 text-primary border-primary/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  low: "bg-muted text-muted-foreground border-border",
};

const OptimizationCard = ({ optimization, isPremium = false }: OptimizationCardProps) => {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-base font-semibold text-foreground">{optimization.area}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={`text-xs ${priorityConfig[optimization.priority]}`}>
              {optimization.priority} priority
            </Badge>
            <Badge variant="outline" className={`text-xs ${impactConfig[optimization.impact]}`}>
              {optimization.impact} impact
            </Badge>
          </div>
        </div>
        <p className="text-sm text-foreground/70 mb-2">
          Current: {optimization.currentState}
        </p>
        <p className="text-base text-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3 mb-3">
          {optimization.recommendation}
        </p>

        {/* Premium: Effort + Expected Outcome */}
        {isPremium ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Effort: {optimization.effort}
            </p>
            <p className="text-sm leading-relaxed border-l-2 border-chart-4/50 pl-3 text-chart-4">
              {optimization.expectedOutcome}
            </p>
          </div>
        ) : (
          <PremiumLock title="Unlock Effort & Expected Outcome">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Effort: {optimization.effort}
              </p>
              <p className="text-sm leading-relaxed border-l-2 border-chart-4/50 pl-3 text-chart-4">
                {optimization.expectedOutcome}
              </p>
            </div>
          </PremiumLock>
        )}
      </CardContent>
    </Card>
  );
};

export default OptimizationCard;
