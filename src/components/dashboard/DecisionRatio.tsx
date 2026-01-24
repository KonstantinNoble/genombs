import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DecisionStats } from "@/hooks/useDashboardStats";

interface DecisionRatioProps {
  stats: DecisionStats;
}

export function DecisionRatio({ stats }: DecisionRatioProps) {
  const total = stats.total_decisions;
  const confirmedPercent = total > 0 ? Math.round((stats.confirmed_count / total) * 100) : 0;
  const draftPercent = total > 0 ? Math.round((stats.draft_count / total) * 100) : 0;

  if (total === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Decision Status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-muted border-dashed" />
            <p className="text-muted-foreground text-sm">No decisions recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Decision Status
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {total} total
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[220px] flex flex-col justify-center">
        {/* Custom donut visualization */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              {/* Confirmed segment */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                strokeDasharray={`${confirmedPercent * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{confirmedPercent}%</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{stats.confirmed_count}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-foreground">{stats.draft_count}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Draft</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
