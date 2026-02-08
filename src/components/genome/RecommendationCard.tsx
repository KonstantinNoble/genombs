import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import type { MarketInsight } from "@/lib/demo-data";

interface RecommendationCardProps {
  recommendation: MarketInsight;
  isPremium?: boolean;
}

const insightConfig = {
  pattern: { label: "Market Pattern", className: "bg-chart-1/15 text-chart-1 border-chart-1/30" },
  gap: { label: "Competitive Gap", className: "bg-primary/15 text-primary border-primary/30" },
  barrier: { label: "Entry Barrier", className: "bg-destructive/15 text-destructive border-destructive/30" },
  signal: { label: "Market Signal", className: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
};

const RecommendationCard = ({ recommendation, isPremium = false }: RecommendationCardProps) => {
  const config = insightConfig[recommendation.insightType];
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
        <p className={`text-sm leading-relaxed mb-2 ${isLocked ? "text-muted-foreground blur-[2px]" : "text-foreground"}`}>
          {recommendation.description}
        </p>
        {!isLocked && recommendation.implication && (
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
            <span className="font-medium text-primary">What this means:</span>{" "}
            {recommendation.implication}
          </p>
        )}
        {isLocked && (
          <p className="text-xs text-primary mt-2 font-medium">Upgrade to Premium for full details</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
