import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QuickWin } from "@/lib/demo-data";

interface QuickWinsProps {
  wins: QuickWin[];
}

const effortColors = {
  low: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  medium: "bg-chart-3/15 text-chart-3 border-chart-3/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

const QuickWins = ({ wins }: QuickWinsProps) => {
  if (!wins || wins.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Quick Wins</h2>
        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wide">
          Highest-impact actions to implement first
        </p>
        <ul className="space-y-4">
          {wins.map((win, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm text-muted-foreground leading-relaxed">{win.action}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${effortColors[win.effort]}`}>
                    Effort: {win.effort}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">{win.timeframe}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickWins;
