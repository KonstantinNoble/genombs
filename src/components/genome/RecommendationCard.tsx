import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import type { Recommendation } from "@/lib/demo-data";

interface RecommendationCardProps {
  recommendation: Recommendation;
  isPremium?: boolean;
}

const priorityConfig = {
  high: { label: "High", className: "bg-primary/15 text-primary border-primary/30" },
  medium: { label: "Medium", className: "bg-chart-3/15 text-chart-3 border-chart-3/30" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

const RecommendationCard = ({ recommendation, isPremium = false }: RecommendationCardProps) => {
  const config = priorityConfig[recommendation.priority];
  const isLocked = recommendation.premiumOnly && !isPremium;

  return (
    <Card className={`border-border bg-card ${isLocked ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {recommendation.category}
            </Badge>
          </div>
          {isLocked && (
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${isLocked ? "text-muted-foreground blur-[2px]" : "text-muted-foreground"}`}>
          {recommendation.description}
        </p>
        {isLocked && (
          <p className="text-xs text-primary mt-2 font-medium">Upgrade to Premium for full details</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
