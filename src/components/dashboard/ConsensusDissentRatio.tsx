import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValidationStats } from "@/hooks/useDashboardStats";

interface ConsensusDissentRatioProps {
  stats: ValidationStats;
}

export function ConsensusDissentRatio({ stats }: ConsensusDissentRatioProps) {
  const total = stats.total_validations;
  const consensusPercent = stats.consensus_rate;
  const dissentPercent = total > 0 ? 100 - consensusPercent : 0;

  if (total === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consensus vs Dissent
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-muted border-dashed" />
            <p className="text-muted-foreground text-sm">No analyses recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate counts based on percentages
  const consensusCount = Math.round((consensusPercent / 100) * total);
  const dissentCount = total - consensusCount;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Consensus vs Dissent
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {total} analyses
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[220px] flex flex-col justify-center">
        {/* Custom donut visualization */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Background ring (dissent) */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(45, 93%, 47%)"
                strokeWidth="12"
                opacity="0.3"
              />
              {/* Consensus segment */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth="12"
                strokeDasharray={`${consensusPercent * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">{consensusPercent}%</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Consensus</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[hsl(142,71%,45%)]" />
            <div>
              <p className="text-sm font-medium text-foreground">{consensusCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Consensus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[hsl(45,93%,47%)]/30" />
            <div>
              <p className="text-sm font-medium text-foreground">{dissentCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dissent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
