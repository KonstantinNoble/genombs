import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricData {
  name: string;
  startValue: string;
  currentValue: string;
  targetValue: string;
}

interface MetricsTrackerProps {
  successMetrics: string[];
  metricsData: MetricData[];
  onUpdate: (metrics: MetricData[]) => void;
  disabled?: boolean;
}

export function MetricsTracker({
  successMetrics,
  metricsData,
  onUpdate,
  disabled,
}: MetricsTrackerProps) {
  const [localMetrics, setLocalMetrics] = useState<MetricData[]>(() => {
    return successMetrics.map((name) => {
      const existing = metricsData.find((m) => m.name === name);
      return (
        existing || {
          name,
          startValue: "0",
          currentValue: "0",
          targetValue: "100",
        }
      );
    });
  });

  useEffect(() => {
    setLocalMetrics(
      successMetrics.map((name) => {
        const existing = metricsData.find((m) => m.name === name);
        return (
          existing || {
            name,
            startValue: "0",
            currentValue: "0",
            targetValue: "100",
          }
        );
      })
    );
  }, [successMetrics, metricsData]);

  const handleChange = (index: number, value: string) => {
    const updated = [...localMetrics];
    updated[index] = { ...updated[index], currentValue: value };
    setLocalMetrics(updated);
  };

  const handleBlur = () => {
    onUpdate(localMetrics);
  };

  const getTrendIcon = (metric: MetricData) => {
    const start = parseFloat(metric.startValue) || 0;
    const current = parseFloat(metric.currentValue) || 0;

    if (current > start) {
      return <TrendingUp className="h-3.5 w-3.5 text-primary" />;
    } else if (current < start) {
      return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    }
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  if (localMetrics.length === 0) {
    return (
      <div className="text-center py-3 text-muted-foreground text-sm">
        No metrics defined.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {localMetrics.map((metric, index) => (
        <div
          key={metric.name}
          className="flex items-center justify-between gap-3 py-1.5"
        >
          <span className="text-sm text-muted-foreground truncate flex-1">
            {metric.name}
          </span>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">
              {metric.startValue} →
            </span>
            <Input
              type="text"
              value={metric.currentValue}
              onChange={(e) => handleChange(index, e.target.value)}
              onBlur={handleBlur}
              className="w-16 h-7 text-center text-sm"
              disabled={disabled}
            />
            <span className="text-xs text-muted-foreground">
              / {metric.targetValue}
            </span>
            {getTrendIcon(metric)}
          </div>
        </div>
      ))}
    </div>
  );
}
