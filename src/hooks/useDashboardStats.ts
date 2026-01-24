import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ValidationStats {
  total_validations: number;
  avg_confidence: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  low_confidence_count: number;
  first_validation: string | null;
  last_validation: string | null;
  active_days: number;
  consensus_rate: number;
}

export interface DecisionStats {
  total_decisions: number;
  confirmed_decisions: number;
  draft_count: number;
  confirmed_count: number;
  total_exports: number;
}

export interface ModelUsage {
  gptMini: number;
  geminiPro: number;
  geminiFlash: number;
  perplexity: number;
  claude: number;
  sonarReasoning: number;
}

export interface ConfidenceTrendPoint {
  created_at: string;
  confidence: number;
  date: string;
}

export interface DashboardStats {
  validation_stats: ValidationStats;
  decision_stats: DecisionStats;
  model_usage: ModelUsage;
  confidence_trend: ConfidenceTrendPoint[];
}

export function useDashboardStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard-stats", userId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const { data, error } = await supabase.rpc("get_user_dashboard_stats", {
        p_user_id: userId,
      });

      if (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }

      return data as unknown as DashboardStats;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Helper function to calculate insights based on stats
export function generateInsights(stats: DashboardStats | undefined): string[] {
  if (!stats) return [];

  const insights: string[] = [];
  const { validation_stats, decision_stats, model_usage } = stats;

  // Confidence insight
  if (validation_stats.avg_confidence >= 75) {
    insights.push(
      `Your average confidence of ${validation_stats.avg_confidence}% is excellent — you're making well-validated decisions.`
    );
  } else if (validation_stats.avg_confidence >= 50) {
    insights.push(
      `Your average confidence is ${validation_stats.avg_confidence}%. Consider adding more context to your queries for better validation.`
    );
  } else if (validation_stats.total_validations > 0) {
    insights.push(
      `Your average confidence is ${validation_stats.avg_confidence}%. Try being more specific in your decision descriptions.`
    );
  }

  // Model usage insight
  const totalModelUsage = Object.values(model_usage).reduce((a, b) => a + b, 0);
  if (totalModelUsage > 0) {
    const topModel = Object.entries(model_usage).sort(([, a], [, b]) => b - a)[0];
  const modelNames: Record<string, string> = {
    gptMini: "GPT-5 Mini",
    geminiPro: "Gemini 3 Pro",
    geminiFlash: "Gemini Flash",
    perplexity: "Perplexity Sonar",
    claude: "Claude Sonnet 4",
    sonarReasoning: "Sonar Reasoning Pro",
  };
    const percentage = Math.round((topModel[1] / totalModelUsage) * 100);
    if (percentage > 60) {
      insights.push(
        `You rely heavily on ${modelNames[topModel[0]]} (${percentage}%). Try diversifying models for broader perspectives.`
      );
    }
  }

  // Decision documentation insight
  if (decision_stats.total_decisions > 0) {
    const confirmRate = Math.round(
      (decision_stats.confirmed_decisions / decision_stats.total_decisions) * 100
    );
    if (confirmRate >= 80) {
      insights.push(
        `${confirmRate}% of your decisions are confirmed — excellent documentation discipline.`
      );
    } else if (decision_stats.draft_count > 0) {
      insights.push(
        `You have ${decision_stats.draft_count} draft decision${decision_stats.draft_count > 1 ? "s" : ""} pending confirmation.`
      );
    }
  }

  // Activity insight
  if (validation_stats.active_days >= 7) {
    insights.push(
      `You've been active for ${validation_stats.active_days} days — building a strong decision trail.`
    );
  }

  // Export insight
  if (decision_stats.total_exports > 5) {
    insights.push(
      `You've exported ${decision_stats.total_exports} reports — your stakeholders are well-informed.`
    );
  }

  return insights.slice(0, 4); // Max 4 insights
}
