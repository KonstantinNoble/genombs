// App constants - add new feature constants here

// ─── Credit System ───

export const CREDIT_COSTS = {
  chat: { cheap: 1, expensive: 3 },
  analysis: { cheap: 5, expensive: 10 },
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
  return isExpensiveModel(modelId) ? CREDIT_COSTS.chat.expensive : CREDIT_COSTS.chat.cheap;
}

export function getAnalysisCreditCost(modelId: string): number {
  return isExpensiveModel(modelId) ? CREDIT_COSTS.analysis.expensive : CREDIT_COSTS.analysis.cheap;
}
