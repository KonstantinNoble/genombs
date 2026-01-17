import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExperimentSetupData } from "@/components/experiment/ExperimentSetupDialog";
import type { Json } from "@/integrations/supabase/types";

interface Experiment {
  id: string;
  user_id: string;
  validation_id: string | null;
  title: string;
  hypothesis: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "abandoned";
  success_metrics: string[];
  final_review: Record<string, unknown> | null;
  decision_question: string | null;
  final_decision: string | null;
  decision_rationale: string | null;
  created_at: string;
  updated_at: string;
}

interface ExperimentTask {
  id: string;
  experiment_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  outcome: string | null;
  order_index: number;
  created_at: string;
}

interface ExperimentCheckpoint {
  id: string;
  experiment_id: string;
  title: string;
  due_date: string;
  metrics_data: unknown | null;
  reflection: string | null;
  completed: boolean;
  completed_at: string | null;
  order_index: number;
  created_at: string;
}

export function useExperiment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createExperiment = async (
    validationId: string,
    data: ExperimentSetupData
  ): Promise<Experiment | null> => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Not authenticated");
      }

      // Deactivate any existing active experiments for this validation
      await supabase
        .from("experiments")
        .update({ status: "abandoned" })
        .eq("validation_id", validationId)
        .eq("status", "active");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.durationDays);

      // Create experiment
      const { data: experiment, error: experimentError } = await supabase
        .from("experiments")
        .insert({
          user_id: userData.user.id,
          validation_id: validationId,
          title: data.title,
          hypothesis: data.hypothesis,
          duration_days: data.durationDays,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          success_metrics: data.successMetrics,
          decision_question: (data as any).decisionQuestion || null,
        })
        .select()
        .single();

      if (experimentError) throw experimentError;

      // Create tasks from selected actions
      const tasks = data.selectedActions.map((action, index) => ({
        experiment_id: experiment.id,
        title: action.action,
        description: action.reasoning,
        order_index: index,
      }));

      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from("experiment_tasks")
          .insert(tasks);

        if (tasksError) throw tasksError;
      }

      // Create checkpoints based on duration
      const checkpoints = generateCheckpoints(
        experiment.id,
        data.durationDays,
        startDate
      );

      if (checkpoints.length > 0) {
        const { error: checkpointsError } = await supabase
          .from("experiment_checkpoints")
          .insert(checkpoints);

        if (checkpointsError) throw checkpointsError;
      }

      toast({
        title: "Experiment Started",
        description: `Your ${data.durationDays}-day experiment has begun!`,
      });

      return experiment as Experiment;
    } catch (error) {
      console.error("Error creating experiment:", error);
      toast({
        title: "Error",
        description: "Failed to create experiment. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveExperiment = async (
    validationId: string
  ): Promise<Experiment | null> => {
    try {
      const { data, error } = await supabase
        .from("experiments")
        .select("*")
        .eq("validation_id", validationId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data as Experiment | null;
    } catch (error) {
      console.error("Error fetching experiment:", error);
      return null;
    }
  };

  const getExperimentWithDetails = async (experimentId: string) => {
    try {
      const [experimentResult, tasksResult, checkpointsResult] =
        await Promise.all([
          supabase.from("experiments").select("*").eq("id", experimentId).single(),
          supabase
            .from("experiment_tasks")
            .select("*")
            .eq("experiment_id", experimentId)
            .order("order_index"),
          supabase
            .from("experiment_checkpoints")
            .select("*")
            .eq("experiment_id", experimentId)
            .order("order_index"),
        ]);

      if (experimentResult.error) throw experimentResult.error;

      return {
        experiment: experimentResult.data as Experiment,
        tasks: (tasksResult.data || []) as ExperimentTask[],
        checkpoints: (checkpointsResult.data || []) as ExperimentCheckpoint[],
      };
    } catch (error) {
      console.error("Error fetching experiment details:", error);
      return null;
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<ExperimentTask>
  ): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.completed !== undefined) {
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }
      
      const { error } = await supabase
        .from("experiment_tasks")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating task:", error);
      return false;
    }
  };

  const updateExperimentDecision = async (
    experimentId: string,
    decision: "go" | "no_go",
    rationale: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("experiments")
        .update({
          status: "completed",
          final_decision: decision,
          decision_rationale: rationale,
        })
        .eq("id", experimentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating experiment decision:", error);
      return false;
    }
  };

  const updateCheckpoint = async (
    checkpointId: string,
    updates: { completed?: boolean; reflection?: string; metrics_data?: Json }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("experiment_checkpoints")
        .update({
          ...updates,
          completed_at: updates.completed ? new Date().toISOString() : null,
        })
        .eq("id", checkpointId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating checkpoint:", error);
      return false;
    }
  };

  const completeExperiment = async (experimentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("experiments")
        .update({ status: "completed" })
        .eq("id", experimentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error completing experiment:", error);
      return false;
    }
  };

  const abandonExperiment = async (experimentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("experiments")
        .update({ status: "abandoned" })
        .eq("id", experimentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error abandoning experiment:", error);
      return false;
    }
  };

  const archiveExperiment = async (experimentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("experiments")
        .update({ status: "abandoned" })
        .eq("id", experimentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error archiving experiment:", error);
      return false;
    }
  };

  return {
    isLoading,
    createExperiment,
    getActiveExperiment,
    getExperimentWithDetails,
    updateTask,
    updateCheckpoint,
    updateExperimentDecision,
    completeExperiment,
    abandonExperiment,
    archiveExperiment,
  };
}

function generateCheckpoints(
  experimentId: string,
  durationDays: number,
  startDate: Date
) {
  const checkpoints: {
    experiment_id: string;
    title: string;
    due_date: string;
    order_index: number;
  }[] = [];

  if (durationDays === 7) {
    // Day 3 and Day 7
    checkpoints.push(
      {
        experiment_id: experimentId,
        title: "Mid-Week Check-in",
        due_date: addDays(startDate, 3).toISOString(),
        order_index: 0,
      },
      {
        experiment_id: experimentId,
        title: "Final Review",
        due_date: addDays(startDate, 7).toISOString(),
        order_index: 1,
      }
    );
  } else if (durationDays === 14) {
    // Day 3, Day 7, Day 14
    checkpoints.push(
      {
        experiment_id: experimentId,
        title: "Week 1 Check-in",
        due_date: addDays(startDate, 3).toISOString(),
        order_index: 0,
      },
      {
        experiment_id: experimentId,
        title: "Mid-Point Review",
        due_date: addDays(startDate, 7).toISOString(),
        order_index: 1,
      },
      {
        experiment_id: experimentId,
        title: "Final Review",
        due_date: addDays(startDate, 14).toISOString(),
        order_index: 2,
      }
    );
  } else {
    // 30 days: Day 7, Day 14, Day 21, Day 30
    checkpoints.push(
      {
        experiment_id: experimentId,
        title: "Week 1 Review",
        due_date: addDays(startDate, 7).toISOString(),
        order_index: 0,
      },
      {
        experiment_id: experimentId,
        title: "Week 2 Review",
        due_date: addDays(startDate, 14).toISOString(),
        order_index: 1,
      },
      {
        experiment_id: experimentId,
        title: "Week 3 Review",
        due_date: addDays(startDate, 21).toISOString(),
        order_index: 2,
      },
      {
        experiment_id: experimentId,
        title: "Final Review",
        due_date: addDays(startDate, 30).toISOString(),
        order_index: 3,
      }
    );
  }

  return checkpoints;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
