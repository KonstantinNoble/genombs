import { Card, CardContent } from "@/components/ui/card";

interface MarketOverviewProps {
  marketSize?: {
    value: number;
    unit: string;
    projectedValue: number;
    projectionYear: number;
  };
}

export function MarketOverview({ marketSize }: MarketOverviewProps) {
  if (!marketSize) return null;

  // Dynamically determine unit from Perplexity data
  const isMillions = marketSize.unit?.toLowerCase().includes('million');
  const displayUnit = isMillions ? 'M' : 'B';

  const metrics = [
    {
      label: "Current Market Size",
      value: `$${marketSize.value}`,
      unit: displayUnit
    },
    {
      label: `${marketSize.projectionYear || 2030} Projection`,
      value: `$${marketSize.projectedValue}`,
      unit: displayUnit
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {metrics.map((metric, index) => (
        <Card 
          key={index} 
          className="bg-card/80 backdrop-blur-sm border-border/50"
        >
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">{metric.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">
              {metric.value}
              <span className="text-2xl sm:text-3xl font-bold text-foreground ml-0.5">
                {metric.unit}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
