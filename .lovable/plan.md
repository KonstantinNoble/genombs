
# Bugfixes fuer `add-github-analysis` Edge Function

## Gefundene Bugs

### Bug 1: Fehlender Credit-Reset-Check (Kritisch)

**Datei:** `supabase/functions/add-github-analysis/index.ts`, Zeilen 329-346

Die Funktion liest nur `credits_used` und `daily_credits_limit`, ignoriert aber `credits_reset_at`. Wenn die 24-Stunden-Periode abgelaufen ist, werden die Credits nicht zurueckgesetzt -- der User wird faelschlicherweise blockiert.

**Vergleich:** `analyze-website` hat die korrekte Logik in `checkAndDeductAnalysisCredits()` (Zeilen 420-428), die `credits_reset_at` prueft und bei Ablauf `credits_used` auf 0 setzt.

**Fix:** Die Credit-Pruefung in `add-github-analysis` erweitern:
- `credits_reset_at` aus der DB lesen
- Pruefen ob `credits_reset_at < now()` -- wenn ja, `credits_used` auf 0 zuruecksetzen und neuen Reset-Zeitpunkt setzen
- Dann erst den Vergleich `remaining < cost` durchfuehren

### Bug 2: Fehlende Premium-Model-Pruefung (Mittel)

**Datei:** `supabase/functions/add-github-analysis/index.ts`, Zeilen 338-346

Free-User koennen teure Modelle (`gpt`, `claude-sonnet`, `perplexity`) fuer die Code-Analyse auswaehlen -- das Backend blockiert sie nicht. In `analyze-website` ist diese Pruefung korrekt implementiert (Zeile 504: `isExpensiveModel(model)` + Premium-Check).

**Fix:** Vor dem Credit-Check pruefen ob das gewaehlte Modell ein "expensive model" ist und der User kein Premium-Abo hat. Falls ja, mit `403` und `"premium_model_required"` antworten.

## Keine weiteren Bugs gefunden

Die restliche Pipeline ist korrekt:
- `process-analysis-queue`: Credit-System wird nicht benoetigt (Credits werden bereits in `analyze-website` abgezogen), Model-Routing und JSON-Parsing funktionieren korrekt
- `analyze-website`: Credit-Reset, Premium-Gating, Queue-Erstellung -- alles korrekt
- `fetch-github-repo`: Public-API-Zugriff, Datei-Filterung, Limits -- alles korrekt
- Frontend (`Chat.tsx`): Model-Weitergabe an beide Analysen korrekt

## Technische Umsetzung

**Datei:** `supabase/functions/add-github-analysis/index.ts`

Aenderung 1 -- Credit-Abfrage erweitern (Zeile 331):

```typescript
// Vorher:
.select("credits_used, daily_credits_limit")

// Nachher:
.select("credits_used, daily_credits_limit, credits_reset_at, is_premium")
```

Aenderung 2 -- Premium-Gating hinzufuegen (nach Zeile 338):

```typescript
const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"];
if (EXPENSIVE_MODELS.includes(selectedModel) && !credits?.is_premium) {
  return new Response(
    JSON.stringify({ error: "premium_model_required" }),
    { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

Aenderung 3 -- Credit-Reset-Logik hinzufuegen (Zeilen 335-337 ersetzen):

```typescript
let creditsUsed = credits?.credits_used ?? 0;
const creditsLimit = credits?.daily_credits_limit ?? 20;
const resetAt = credits?.credits_reset_at ? new Date(credits.credits_reset_at) : new Date();

// Reset credits if period expired
if (resetAt < new Date()) {
  creditsUsed = 0;
  await supabase
    .from("user_credits")
    .update({
      credits_used: 0,
      credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("user_id", user.id);
}

const remaining = creditsLimit - creditsUsed;
```

Aenderung 4 -- Credit-Abzug mit korrektem Wert (Zeile 419):

```typescript
// Vorher:
.update({ credits_used: creditsUsed + cost, ... })

// Nachher (nutzt den ggf. zurueckgesetzten Wert):
.update({ credits_used: creditsUsed + cost, updated_at: new Date().toISOString() })
```

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `supabase/functions/add-github-analysis/index.ts` | Credit-Reset + Premium-Gating hinzufuegen |
