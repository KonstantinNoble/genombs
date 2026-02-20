
# Credit-Kosten erhoehen (+4 Credits Analyse, +2 Credits Chat)

## Neue Werte

### Chat (+2 Credits)
| Modell | Aktuell | Neu |
|--------|---------|-----|
| gemini-flash | 1 | 3 |
| gpt-mini | 1 | 3 |
| gpt | 4 | 6 |
| claude-sonnet | 4 | 6 |
| perplexity | 5 | 7 |

### Website-Analyse (+4 Credits)
| Modell | Aktuell | Neu |
|--------|---------|-----|
| gemini-flash | 5 | 9 |
| gpt-mini | 5 | 9 |
| gpt | 8 | 12 |
| claude-sonnet | 8 | 12 |
| perplexity | 10 | 14 |

### Code-Analyse (+4 Credits)
| Modell | Aktuell | Neu |
|--------|---------|-----|
| gemini-flash | 8 | 12 |
| gpt-mini | 8 | 12 |
| gpt | 12 | 16 |
| claude-sonnet | 12 | 16 |
| perplexity | 15 | 19 |

## Betroffene Dateien (4 Stellen)

1. **`src/lib/constants.ts`** -- Frontend-Konstanten (alle 3 Kategorien)
2. **`supabase/functions/chat/index.ts`** -- Backend Chat-Abrechnung
3. **`supabase/functions/analyze-website/index.ts`** -- Backend URL-Analyse-Abrechnung + Refund
4. **`supabase/functions/process-analysis-queue/index.ts`** -- Backend Queue-Refund-Logik
5. **`supabase/functions/add-github-analysis/index.ts`** -- Backend Code-Analyse-Abrechnung

Alle 5 Stellen muessen synchron aktualisiert werden, damit UI-Anzeige und Abrechnung uebereinstimmen. Die Default-Fallback-Werte in den Funktionen werden ebenfalls angepasst.
