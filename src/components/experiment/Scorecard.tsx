import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface ScoreMetric {
  name: string;
  weight: number;
  score: number;
}

interface ScorecardProps {
  metrics: ScoreMetric[];
  onUpdate: (metrics: ScoreMetric[]) => void;
  disabled?: boolean;
}

export function Scorecard({ metrics, onUpdate, disabled }: ScorecardProps) {
  const [localMetrics, setLocalMetrics] = useState<ScoreMetric[]>(metrics);

  useEffect(() => {
    setLocalMetrics(metrics);
  }, [metrics]);

  const handleScoreChange = (index: number, value: number[]) => {
    const updated = [...localMetrics];
    updated[index] = { ...updated[index], score: value[0] };
    setLocalMetrics(updated);
    onUpdate(updated);
  };

  const calculateOverallScore = () => {
    if (localMetrics.length === 0) return 0;
    const totalWeight = localMetrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = localMetrics.reduce(
      (sum, m) => sum + m.score * m.weight,
      0
    );
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const overallScore = calculateOverallScore();

  const getScoreColor = (score: number) => {
    if (score >= 7) return "bg-primary";
    if (score >= 4) return "bg-yellow-500";
    return "bg-destructive";
  };

  if (localMetrics.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-base">
        No scoring criteria defined.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {localMetrics.map((metric, index) => (
        <div key={metric.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base text-foreground">{metric.name}</span>
            <span className="text-base font-semibold tabular-nums">
              {metric.score}/10
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getScoreColor(metric.score)}`}
                style={{ width: `${metric.score * 10}%` }}
              />
            </div>
            <Slider
              value={[metric.score]}
              onValueChange={(value) => handleScoreChange(index, value)}
              min={1}
              max={10}
              step={1}
              disabled={disabled}
              className="w-28"
            />
          </div>
        </div>
      ))}

      {/* Overall Score */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Overall Score</span>
          <span
            className={`text-2xl font-bold tabular-nums ${
              overallScore >= 7
                ? "text-primary"
                : overallScore >= 4
                ? "text-yellow-600"
                : "text-destructive"
            }`}
          >
            {overallScore.toFixed(1)}/10
          </span>
        </div>
      </div>
    </div>
  );
}
