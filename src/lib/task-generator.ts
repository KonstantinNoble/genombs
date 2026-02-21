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
    { task_text: 'Optimiere deine Meta-Description auf unter 160 Zeichen mit einem klaren Call-to-Action', category: 'findability' },
    { task_text: 'Füge strukturierte Daten (Schema.org) für deine wichtigste Seite hinzu', category: 'findability' },
    { task_text: 'Überprüfe und optimiere deine H1-Überschrift für das Haupt-Keyword', category: 'findability' },
  ],
  trust: [
    { task_text: 'Füge Kundenbewertungen oder Testimonials auf deiner Startseite hinzu', category: 'trust' },
    { task_text: 'Platziere Trust-Badges (SSL, Zahlungsanbieter) im sichtbaren Bereich', category: 'trust' },
    { task_text: 'Ergänze ein vollständiges Impressum und eine Datenschutzerklärung', category: 'trust' },
  ],
  conversion: [
    { task_text: 'Platziere einen klaren Call-to-Action oberhalb des Folds', category: 'conversion' },
    { task_text: 'Reduziere die Formularfelder auf das absolute Minimum', category: 'conversion' },
    { task_text: 'Füge Social Proof direkt neben deinem CTA-Button ein', category: 'conversion' },
  ],
  design: [
    { task_text: 'Erhöhe den Farbkontrast deines primären CTA-Buttons', category: 'design' },
    { task_text: 'Optimiere die mobile Darstellung deiner Navigation', category: 'design' },
    { task_text: 'Vereinheitliche Abstände und Schriftgrößen auf der Startseite', category: 'design' },
  ],
  performance: [
    { task_text: 'Komprimiere Bilder auf deiner Startseite (WebP-Format verwenden)', category: 'performance' },
    { task_text: 'Aktiviere Browser-Caching für statische Assets', category: 'performance' },
    { task_text: 'Entferne nicht verwendete CSS- und JavaScript-Dateien', category: 'performance' },
  ],
  content: [
    { task_text: 'Überarbeite deine Startseiten-Headline: Nutzen statt Feature kommunizieren', category: 'content' },
    { task_text: 'Füge einen FAQ-Bereich mit den 5 häufigsten Kundenfragen hinzu', category: 'content' },
    { task_text: 'Ergänze Alt-Texte für alle Bilder auf der Startseite', category: 'content' },
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

  // Convert to array and sort ascending by score
  const sorted: CategoryScore[] = Object.entries(categoryScores)
    .map(([category, score]) => ({ category: category.toLowerCase(), score: typeof score === 'number' ? score : 0 }))
    .sort((a, b) => a.score - b.score);

  const tasks: TaskSuggestion[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Take the 2 weakest categories
  for (let i = 0; i < Math.min(2, sorted.length); i++) {
    const cat = sorted[i].category;
    const pool = TASK_POOL[cat];
    if (!pool || pool.length === 0) continue;

    // Simple deterministic selection based on date + category
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0) + i;
    const index = seed % pool.length;
    tasks.push(pool[index]);
  }

  return tasks;
}
