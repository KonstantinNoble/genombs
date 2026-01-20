import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ActionCard } from "./ActionCard";
import { useExperiment } from "@/hooks/useExperiment";

interface ExperimentWorkflowProps {
  validationId: string;
}

export function ExperimentWorkflow({ validationId }: ExperimentWorkflowProps) {
  const {
    getActiveExperiment,
    getExperimentWithDetails,
    updateTask,
  } = useExperiment();

  const [isLoading, setIsLoading] = useState(true);
  const [experiment, setExperiment] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

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

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="py-8 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
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
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base text-muted-foreground uppercase tracking-wide">
            Validation Actions
          </span>
          <span className="font-medium text-muted-foreground">
            {completedActions}/{totalActions}
          </span>
        </div>

        {/* Actions Liste */}
        <div className="bg-muted/30 rounded-xl px-4 py-2">
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
      </CardContent>
    </Card>
  );
}
