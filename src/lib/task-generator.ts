/**
 * Deterministic task generation from category_scores.
 * No LLM call needed — maps low scores to predefined improvement tasks.
 */

interface CategoryScore {
  category: string;
  score: number;
}

interface TaskSuggestion {
  task_text: string;
  category: string;
}

const TASK_POOL: Record<string, TaskSuggestion[]> = {
  findability: [
    { task_text: 'Optimize your meta description to under 160 characters with a clear call-to-action', category: 'findability' },
    { task_text: 'Add structured data (Schema.org) to your most important page', category: 'findability' },
    { task_text: 'Review and optimize your H1 heading for your main keyword', category: 'findability' },
  ],
  trustproof: [
    { task_text: 'Add customer reviews or testimonials to your homepage', category: 'trustProof' },
    { task_text: 'Place trust badges (SSL, payment providers) in a visible area', category: 'trustProof' },
    { task_text: 'Add a complete imprint and privacy policy page', category: 'trustProof' },
  ],
  conversionreadiness: [
    { task_text: 'Place a clear call-to-action above the fold', category: 'conversionReadiness' },
    { task_text: 'Reduce your form fields to the absolute minimum', category: 'conversionReadiness' },
    { task_text: 'Add social proof directly next to your CTA button', category: 'conversionReadiness' },
  ],
  mobileusability: [
    { task_text: 'Optimize the mobile layout of your navigation', category: 'mobileUsability' },
    { task_text: 'Ensure all buttons are at least 44x44px for touch targets', category: 'mobileUsability' },
    { task_text: 'Test and fix horizontal scrolling issues on mobile devices', category: 'mobileUsability' },
  ],
  offerclarity: [
    { task_text: 'Rewrite your homepage headline: communicate benefits, not features', category: 'offerClarity' },
    { task_text: 'Add an FAQ section with the 5 most common customer questions', category: 'offerClarity' },
    { task_text: 'Make your unique value proposition visible within 3 seconds', category: 'offerClarity' },
  ],
};

/**
 * Generate 1-2 micro-tasks from the weakest category scores.
 * Uses a seeded random selection based on the date to avoid duplicates on the same day.
 */
export function generateTasksFromScores(
  categoryScores: Record<string, number> | null
): TaskSuggestion[] {
  if (!categoryScores) return [];

  const sorted: CategoryScore[] = Object.entries(categoryScores)
    .map(([category, score]) => ({ category: category.toLowerCase(), score: typeof score === 'number' ? score : 0 }))
    .sort((a, b) => a.score - b.score);

  const tasks: TaskSuggestion[] = [];
  const today = new Date().toISOString().split('T')[0];

  for (let i = 0; i < Math.min(2, sorted.length); i++) {
    const cat = sorted[i].category;
    const pool = TASK_POOL[cat];
    if (!pool || pool.length === 0) continue;

    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0) + i;
    const index = seed % pool.length;
    tasks.push(pool[index]);
  }

  return tasks;
}
