import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TaskCard } from "./TaskCard";
import { MetricsTracker } from "./MetricsTracker";
import { DecisionSection } from "./DecisionSection";
import { useExperiment } from "@/hooks/useExperiment";
import { useToast } from "@/hooks/use-toast";
import { FlaskConical, Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface ExperimentWorkflowProps {
  validationId: string;
}

interface MetricData {
  name: string;
  startValue: string;
  currentValue: string;
  targetValue: string;
}

export function ExperimentWorkflow({ validationId }: ExperimentWorkflowProps) {
  const { toast } = useToast();
  const {
    getActiveExperiment,
    getExperimentWithDetails,
    updateTask,
    updateCheckpoint,
    completeExperiment,
    abandonExperiment,
  } = useExperiment();

  const [isLoading, setIsLoading] = useState(true);
  const [experiment, setExperiment] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);

  useEffect(() => {
    loadExperiment();
  }, [validationId]);

  const loadExperiment = async () => {
    setIsLoading(true);
    try {
      const activeExperiment = await getActiveExperiment(validationId);
      if (activeExperiment) {
        const details = await getExperimentWithDetails(activeExperiment.id);
        if (details) {
          setExperiment(details.experiment);
          setTasks(details.tasks);
          setCheckpoints(details.checkpoints);

          // Load metrics data from the first checkpoint if available
          const savedMetrics =
            (details.checkpoints[0]?.metrics_data as MetricData[]) || [];
          setMetricsData(savedMetrics);
        }
      }
    } catch (error) {
      console.error("Error loading experiment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = async (
    taskId: string,
    updates: { completed?: boolean; notes?: string }
  ) => {
    const success = await updateTask(taskId, updates);
    if (success) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...updates,
                completed_at: updates.completed
                  ? new Date().toISOString()
                  : null,
              }
            : t
        )
      );
    }
  };

  const handleMetricsUpdate = async (metrics: MetricData[]) => {
    setMetricsData(metrics);

    // Save to the first checkpoint's metrics_data
    if (checkpoints.length > 0) {
      await updateCheckpoint(checkpoints[0].id, {
        metrics_data: metrics as unknown as Json,
      });
    }
  };

  const handleComplete = async (finalNotes: string) => {
    if (!experiment) return;

    const success = await completeExperiment(experiment.id);
    if (success) {
      setExperiment((prev: any) => ({ ...prev, status: "completed" }));
      toast({
        title: "Experiment Completed",
        description: "Your experiment has been marked as complete.",
      });
    }
  };

  const handleAbandon = async (reason: string) => {
    if (!experiment) return;

    const success = await abandonExperiment(experiment.id);
    if (success) {
      setExperiment((prev: any) => ({ ...prev, status: "abandoned" }));
      toast({
        title: "Experiment Abandoned",
        description: "Your experiment has been abandoned.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!experiment) {
    return null;
  }

  // Calculate progress
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const now = new Date();
  const startDate = new Date(experiment.start_date);
  const endDate = new Date(experiment.end_date);
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsedDays = Math.max(
    0,
    Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);

  const isActive = experiment.status === "active";

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">{experiment.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Day {Math.min(elapsedDays, totalDays)}/{totalDays}
            </span>
            <Progress value={timeProgress} className="w-16 h-1.5" />
            {experiment.status !== "active" && (
              <Badge
                variant={experiment.status === "completed" ? "default" : "destructive"}
                className="text-xs"
              >
                {experiment.status}
              </Badge>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wide">Tasks</span>
            <span>
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="bg-muted/30 rounded-lg px-3 py-1">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                completed={task.completed}
                notes={task.notes}
                onUpdate={(updates) => handleTaskUpdate(task.id, updates)}
                disabled={!isActive}
              />
            ))}
          </div>
        </div>

        {/* Metrics Section */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Metrics
          </div>
          <div className="bg-muted/30 rounded-lg px-3 py-2">
            <MetricsTracker
              successMetrics={experiment.success_metrics as string[]}
              metricsData={metricsData}
              onUpdate={handleMetricsUpdate}
              disabled={!isActive}
            />
          </div>
        </div>

        {/* Decision Section */}
        <div className="pt-2 border-t border-border/50">
          <DecisionSection
            experimentStatus={experiment.status}
            onComplete={handleComplete}
            onAbandon={handleAbandon}
            disabled={!isActive}
          />
        </div>
      </CardContent>
    </Card>
  );
}
