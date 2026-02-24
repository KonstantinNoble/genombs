
# Fix: hoursLeft-Bug in analyze-website

## Problem

In `supabase/functions/analyze-website/index.ts` (Zeile 464-480) gibt es denselben `hoursLeft`-Bug, der bereits in `chat/index.ts` gefixt wurde:

Nach einem Credit-Reset wird `credits_reset_at` auf einen neuen Wert 24h in der Zukunft gesetzt, aber die Variable `resetAt` (Zeile 464) zeigt noch auf den **alten** abgelaufenen Zeitstempel. Wenn dann `hoursLeft` berechnet wird (Zeile 479), ergibt das `0` statt der korrekten Stundenzahl.

## Loesung

Eine Variable `currentResetAt` einfuehren, die nach dem Reset-Block den neuen Wert erhaelt -- identisch zum Fix in `chat/index.ts`.

## Technische Aenderung

**Datei:** `supabase/functions/analyze-website/index.ts` (Zeilen 464-480)

Vorher:
```text
const resetAt = new Date(credits.credits_reset_at);
let creditsUsed = credits.credits_used ?? 0;
if (resetAt < new Date()) {
  creditsUsed = 0;
  await supabaseAdmin
    .from("user_credits")
    .update({ credits_used: 0, credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
    .eq("id", credits.id);
}

const cost = getAnalysisCreditCost(modelKey);
const limit = credits.daily_credits_limit ?? 20;
const remaining = limit - creditsUsed;

if (remaining < cost) {
  const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
  return { ok: false, status: 403, error: `insufficient_credits:${hoursLeft}` };
}
```

Nachher:
```text
let currentResetAt = new Date(credits.credits_reset_at);
let creditsUsed = credits.credits_used ?? 0;
if (currentResetAt < new Date()) {
  creditsUsed = 0;
  currentResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await supabaseAdmin
    .from("user_credits")
    .update({ credits_used: 0, credits_reset_at: currentResetAt.toISOString() })
    .eq("id", credits.id);
}

const cost = getAnalysisCreditCost(modelKey);
const limit = credits.daily_credits_limit ?? 20;
const remaining = limit - creditsUsed;

if (remaining < cost) {
  const hoursLeft = Math.max(0, Math.ceil((currentResetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
  return { ok: false, status: 403, error: `insufficient_credits:${hoursLeft}` };
}
```

## Alles andere ist korrekt

- Prompts: Holistische Scoring-Guides sind konsistent und sinnvoll
- Validierung: `validateAndNormalizeScores` clamped Scores korrekt und berechnet den overallScore als echten Durchschnitt
- PageSpeed-Anchoring: Weiche Formulierung gibt der KI Spielraum
- Credit-Deduction: Nur bei erfolgreichem Abschluss -- korrekt
- Code-Analyse-Validierung: `validateCodeAnalysis` ist robust

## Betroffene Datei

| Datei | Aenderung |
|---|---|
| `supabase/functions/analyze-website/index.ts` | `hoursLeft`-Bug fixen (gleicher Fix wie in chat/index.ts) |
