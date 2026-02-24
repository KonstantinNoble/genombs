// App constants - add new feature constants here

// ─── Credit System ───

// Model-specific credit costs
export const MODEL_CREDIT_COSTS = {
  chat: {
    "gemini-flash": 3,
    "gpt-mini": 3,
    "gpt": 6,
    "claude-sonnet": 6,
    "perplexity": 7,
  },
  analysis: {
    "gemini-flash": 9,
    "gpt-mini": 9,
    "gpt": 12,
    "claude-sonnet": 12,
    "perplexity": 14,
  },
} as const;

export const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"] as const;
export const FREE_MODELS = ["gemini-flash", "gpt-mini"] as const;

export const COMPETITOR_SEARCH_COST = 7;

export const FREE_DAILY_CREDITS = 20;
export const PREMIUM_DAILY_CREDITS = 100;

export const FREE_MAX_URL_FIELDS = 2; // own + 1 competitor
export const PREMIUM_MAX_URL_FIELDS = 4; // own + 3 competitors

export function isExpensiveModel(modelId: string): boolean {
  return (EXPENSIVE_MODELS as readonly string[]).includes(modelId);
}

export function getChatCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.chat as Record<string, number>)[modelId] ?? 3;
}

export function getAnalysisCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.analysis as Record<string, number>)[modelId] ?? 9;
}

