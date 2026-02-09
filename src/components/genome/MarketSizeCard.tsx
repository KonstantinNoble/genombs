import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketSize } from "@/lib/demo-data";

interface MarketSizeCardProps {
  marketSize: MarketSize;
}

const trendLabels = {
  declining: "Declining",
  stable: "Stable",
  growing: "Growing",
  booming: "Booming",
};

const trendColors = {
  declining: "bg-destructive/15 text-destructive border-destructive/30",
  stable: "bg-muted text-muted-foreground border-border",
  growing: "bg-primary/15 text-primary border-primary/30",
  booming: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

const competitionColors = {
  low: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const MarketSizeCard = ({ marketSize }: MarketSizeCardProps) => {
  const maxValue = marketSize.tam.value;

  return (
    <div className="space-y-6">
      {/* TAM / SAM / SOM Visual Bars */}
      <div className="space-y-4">
        {[
          { label: "TAM", sub: "Total Addressable Market", data: marketSize.tam },
          { label: "SAM", sub: "Serviceable Addressable Market", data: marketSize.sam },
          { label: "SOM", sub: "Serviceable Obtainable Market", data: marketSize.som },
        ].map((item) => {
          const widthPercent = maxValue > 0 ? (item.data.value / maxValue) * 100 : 0;
          return (
            <div key={item.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">— {item.sub}</span>
                </div>
                <span className="text-lg font-bold text-foreground">{item.data.label}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${Math.max(widthPercent, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Competition</p>
          <Badge variant="outline" className={competitionColors[marketSize.competitionIntensity]}>
            {marketSize.competitionIntensity}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Growth Trend</p>
          <Badge variant="outline" className={trendColors[marketSize.growthTrend]}>
            {trendLabels[marketSize.growthTrend]}
          </Badge>
        </div>
      </div>

      {/* Benchmarks */}
      {marketSize.benchmarks.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Benchmark</th>
                    <th className="text-left py-3 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {marketSize.benchmarks.map((b) => (
                    <tr key={b.metric} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm text-foreground">{b.metric}</td>
                      <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{b.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarketSizeCard;
