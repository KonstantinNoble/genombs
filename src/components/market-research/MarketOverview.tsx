import { Card, CardContent } from "@/components/ui/card";

interface MarketOverviewProps {
  marketSize?: {
    value: number;
    unit: string;
    tam: number;
    sam: number;
  };
}

export function MarketOverview({ marketSize }: MarketOverviewProps) {
  if (!marketSize) return null;

  const metrics = [
    {
      label: "Total Market Size",
      value: `$${marketSize.value}`,
      unit: marketSize.unit.replace("billion ", "").replace("USD", "B")
    },
    {
      label: "Total Addressable Market",
      value: `$${marketSize.tam}`,
      unit: "B"
    },
    {
      label: "Serviceable Addressable Market",
      value: `$${marketSize.sam}`,
      unit: "B"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
