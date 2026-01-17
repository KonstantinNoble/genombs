import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

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
    // Initialize with existing data or create new entries
    return successMetrics.map((name, index) => {
      const existing = metricsData.find((m) => m.name === name);
      return (
        existing || {
          name,
          startValue: "",
          currentValue: "",
          targetValue: "",
        }
      );
    });
  });

  useEffect(() => {
    // Sync when successMetrics change
    setLocalMetrics(
      successMetrics.map((name) => {
        const existing = metricsData.find((m) => m.name === name);
        return (
          existing || {
            name,
            startValue: "",
            currentValue: "",
            targetValue: "",
          }
        );
      })
    );
  }, [successMetrics]);

  const handleChange = (
    index: number,
    field: keyof MetricData,
    value: string
  ) => {
    const updated = [...localMetrics];
    updated[index] = { ...updated[index], [field]: value };
    setLocalMetrics(updated);
  };

  const handleBlur = () => {
    onUpdate(localMetrics);
  };

  const calculateProgress = (metric: MetricData): number => {
    const start = parseFloat(metric.startValue) || 0;
    const current = parseFloat(metric.currentValue) || 0;
    const target = parseFloat(metric.targetValue) || 0;

    if (target === start) return 0;

    const progress = ((current - start) / (target - start)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getTrendIcon = (metric: MetricData) => {
    const start = parseFloat(metric.startValue) || 0;
    const current = parseFloat(metric.currentValue) || 0;

    if (!metric.startValue || !metric.currentValue) return null;

    if (current > start) {
      return <TrendingUp className="h-4 w-4 text-primary" />;
    } else if (current < start) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (localMetrics.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No success metrics defined for this experiment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localMetrics.map((metric, index) => {
        const progress = calculateProgress(metric);
        const hasValues =
          metric.startValue && metric.currentValue && metric.targetValue;

        return (
          <div
            key={metric.name}
            className="p-4 rounded-xl border-2 border-border bg-card/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">{metric.name}</span>
              </div>
              {getTrendIcon(metric)}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Start Value
                </Label>
                <Input
                  type="text"
                  value={metric.startValue}
                  onChange={(e) =>
                    handleChange(index, "startValue", e.target.value)
                  }
                  onBlur={handleBlur}
                  placeholder="0"
                  className="h-9"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Current Value
                </Label>
                <Input
                  type="text"
                  value={metric.currentValue}
                  onChange={(e) =>
                    handleChange(index, "currentValue", e.target.value)
                  }
                  onBlur={handleBlur}
                  placeholder="0"
                  className="h-9"
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Target</Label>
                <Input
                  type="text"
                  value={metric.targetValue}
                  onChange={(e) =>
                    handleChange(index, "targetValue", e.target.value)
                  }
                  onBlur={handleBlur}
                  placeholder="100"
                  className="h-9"
                  disabled={disabled}
                />
              </div>
            </div>

            {hasValues && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
