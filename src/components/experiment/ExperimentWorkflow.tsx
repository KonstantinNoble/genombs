import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionCard } from "./ActionCard";
import { Scorecard } from "./Scorecard";
import { GoNoGoDecision } from "./GoNoGoDecision";
import { useExperiment } from "@/hooks/useExperiment";
import { useToast } from "@/hooks/use-toast";
import { Target, Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface ExperimentWorkflowProps {
  validationId: string;
}

interface ScoreMetric {
  name: string;
  weight: number;
  score: number;
}

export function ExperimentWorkflow({ validationId }: ExperimentWorkflowProps) {
  const { toast } = useToast();
  const {
    getActiveExperiment,
    getExperimentWithDetails,
    updateTask,
    updateExperimentDecision,
    updateCheckpoint,
    deleteExperiment,
  } = useExperiment();

  const [isLoading, setIsLoading] = useState(true);
  const [experiment, setExperiment] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [scoreMetrics, setScoreMetrics] = useState<ScoreMetric[]>([]);

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

          // Load score metrics from checkpoint or initialize from success_metrics
          const savedMetrics =
            (details.checkpoints[0]?.metrics_data as ScoreMetric[]) || null;

          if (savedMetrics && Array.isArray(savedMetrics) && savedMetrics[0]?.score !== undefined) {
            setScoreMetrics(savedMetrics);
          } else {
            // Convert old success_metrics (string[]) to new ScoreMetric format
            const successMetrics = details.experiment.success_metrics as string[];
            const initialMetrics: ScoreMetric[] = successMetrics.map((name) => ({
              name,
              weight: 1,
              score: 5,
            }));
            setScoreMetrics(initialMetrics);
          }
        }
      }
    } catch (error) {
      console.error("Error loading experiment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionUpdate = async (
    taskId: string,
    updates: { completed?: boolean; outcome?: string }
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

  const handleScoreUpdate = async (metrics: ScoreMetric[]) => {
    setScoreMetrics(metrics);

    // Save to the first checkpoint's metrics_data
    if (checkpoints.length > 0) {
      await updateCheckpoint(checkpoints[0].id, {
        metrics_data: metrics as unknown as Json,
      });
    }
  };

  const calculateOverallScore = () => {
    if (scoreMetrics.length === 0) return 0;
    const totalWeight = scoreMetrics.reduce((sum, m) => sum + m.weight, 0);
    const weightedSum = scoreMetrics.reduce(
      (sum, m) => sum + m.score * m.weight,
      0
    );
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  };

  const handleDecision = async (decision: "go" | "no_go", rationale: string) => {
    if (!experiment) return;

    const success = await updateExperimentDecision(experiment.id, decision, rationale);
    if (success) {
      setExperiment((prev: any) => ({
        ...prev,
        status: "completed",
        final_decision: decision,
        decision_rationale: rationale,
      }));
      toast({
        title: decision === "go" ? "GO Decision Made" : "NO-GO Decision Made",
        description:
          decision === "go"
            ? "You've decided to proceed with this strategy."
            : "You've decided not to pursue this strategy.",
      });
    }
  };

  const handleComplete = async () => {
    if (!experiment) return;
    const success = await deleteExperiment(experiment.id);
    if (success) {
      setExperiment(null);
      toast({
        title: "Decision completed",
        description: "The experiment has been removed. Create a new one via 'Turn into Experiment'.",
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

  const isActive = experiment.status === "active";
  const completedActions = tasks.filter((t) => t.completed).length;
  const totalActions = tasks.length;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        {/* Decision Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">
              Decision: {experiment.decision_question || experiment.title}
            </span>
            {experiment.status !== "active" && (
              <Badge
                variant={experiment.final_decision === "go" ? "default" : "destructive"}
                className="text-xs ml-auto"
              >
                {experiment.final_decision === "go" ? "GO" : "NO-GO"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground italic pl-6">
            "{experiment.hypothesis}"
          </p>
        </div>

        {/* Validation Actions */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wide">
              Validation Actions
            </span>
            <span>
              {completedActions}/{totalActions}
            </span>
          </div>
          <div className="bg-muted/30 rounded-lg px-3 py-1">
            {tasks.map((task) => (
              <ActionCard
                key={task.id}
                id={task.id}
                title={task.title}
                completed={task.completed}
                outcome={task.outcome}
                onUpdate={(updates) => handleActionUpdate(task.id, updates)}
                disabled={!isActive}
              />
            ))}
          </div>
        </div>

        {/* Scorecard */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Decision Scorecard
          </div>
          <div className="bg-muted/30 rounded-lg px-3 py-3">
            <Scorecard
              metrics={scoreMetrics}
              onUpdate={handleScoreUpdate}
              disabled={!isActive}
            />
          </div>
        </div>

        {/* Go/No-Go Decision */}
        <div className="pt-2 border-t border-border/50">
          <GoNoGoDecision
            experimentStatus={experiment.status}
            finalDecision={experiment.final_decision}
            decisionRationale={experiment.decision_rationale}
            overallScore={calculateOverallScore()}
            onDecision={handleDecision}
            onComplete={handleComplete}
            disabled={!isActive}
          />
        </div>
      </CardContent>
    </Card>
  );
}
