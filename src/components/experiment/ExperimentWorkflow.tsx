import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TaskCard } from "./TaskCard";
import { MetricsTracker } from "./MetricsTracker";
import { CheckpointCard } from "./CheckpointCard";
import { DecisionSection } from "./DecisionSection";
import { useExperiment } from "@/hooks/useExperiment";
import { useToast } from "@/hooks/use-toast";
import {
  FlaskConical,
  ListTodo,
  BarChart3,
  Flag,
  Lightbulb,
  Calendar,
  Loader2,
} from "lucide-react";
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

  const handleCheckpointUpdate = async (
    checkpointId: string,
    updates: { reflection?: string; completed?: boolean }
  ) => {
    const success = await updateCheckpoint(checkpointId, updates);
    if (success) {
      setCheckpoints((prev) =>
        prev.map((c) =>
          c.id === checkpointId
            ? {
                ...c,
                ...updates,
                completed_at: updates.completed
                  ? new Date().toISOString()
                  : null,
              }
            : c
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
        title: "Experiment Completed!",
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
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
  const daysRemaining = Math.max(0, totalDays - elapsedDays);
  const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);

  const isCompleted = experiment.status === "completed";
  const isAbandoned = experiment.status === "abandoned";
  const isActive = experiment.status === "active";

  return (
    <Card className="border-primary/20 shadow-elegant">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {experiment.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {experiment.hypothesis}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <Badge className="bg-primary text-primary-foreground">
                Active
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Completed
              </Badge>
            )}
            {isAbandoned && (
              <Badge variant="destructive">Abandoned</Badge>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Day {Math.min(elapsedDays, totalDays)} of {totalDays}
              </span>
            </div>
            <span className="text-muted-foreground">
              {daysRemaining} days remaining
            </span>
          </div>
          <Progress value={timeProgress} className="h-2" />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              <span>
                {completedTasks} of {totalTasks} tasks completed
              </span>
            </div>
            <span className="text-muted-foreground">
              {Math.round(taskProgress)}%
            </span>
          </div>
          <Progress value={taskProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tasks Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-primary" />
            Tasks
          </h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                completed={task.completed}
                completedAt={task.completed_at}
                notes={task.notes}
                orderIndex={task.order_index}
                onUpdate={(updates) => handleTaskUpdate(task.id, updates)}
                disabled={!isActive}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Metrics Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Metrics Tracking
          </h3>
          <MetricsTracker
            successMetrics={experiment.success_metrics as string[]}
            metricsData={metricsData}
            onUpdate={handleMetricsUpdate}
            disabled={!isActive}
          />
        </div>

        <Separator />

        {/* Checkpoints Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            Checkpoints
          </h3>
          <div className="space-y-2">
            {checkpoints.map((checkpoint) => (
              <CheckpointCard
                key={checkpoint.id}
                id={checkpoint.id}
                title={checkpoint.title}
                dueDate={checkpoint.due_date}
                reflection={checkpoint.reflection}
                completed={checkpoint.completed}
                completedAt={checkpoint.completed_at}
                orderIndex={checkpoint.order_index}
                onUpdate={(updates) =>
                  handleCheckpointUpdate(checkpoint.id, updates)
                }
                disabled={!isActive}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Decision Section */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            Final Decision
          </h3>
          <DecisionSection
            hypothesis={experiment.hypothesis}
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
