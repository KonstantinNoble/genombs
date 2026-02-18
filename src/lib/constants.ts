// App constants - add new feature constants here

// ─── Credit System ───

// Model-specific credit costs
export const MODEL_CREDIT_COSTS = {
  chat: {
    "gemini-flash": 1,
    "gpt-mini": 1,
    "gpt": 4,
    "claude-sonnet": 4,
    "perplexity": 5,
  },
  analysis: {
    "gemini-flash": 5,
    "gpt-mini": 5,
    "gpt": 8,
    "claude-sonnet": 8,
    "perplexity": 10,
  },
  codeAnalysis: {
    "gemini-flash": 8,
    "gpt-mini": 8,
    "gpt": 12,
    "claude-sonnet": 12,
    "perplexity": 15,
  },
} as const;

export const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"] as const;
export const FREE_MODELS = ["gemini-flash", "gpt-mini"] as const;

export const FREE_DAILY_CREDITS = 20;
export const PREMIUM_DAILY_CREDITS = 100;

export const FREE_MAX_URL_FIELDS = 2; // own + 1 competitor
export const PREMIUM_MAX_URL_FIELDS = 4; // own + 3 competitors

export function isExpensiveModel(modelId: string): boolean {
  return (EXPENSIVE_MODELS as readonly string[]).includes(modelId);
}

export function getChatCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.chat as Record<string, number>)[modelId] ?? 1;
}

export function getAnalysisCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.analysis as Record<string, number>)[modelId] ?? 5;
}

export function getCodeAnalysisCreditCost(modelId: string): number {
  return (MODEL_CREDIT_COSTS.codeAnalysis as Record<string, number>)[modelId] ?? 8;
}
