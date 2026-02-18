

# Duplicate Key Bug in CodeAnalysisCard beheben

## Problem

Die Console-Logs zeigen: **"Encountered two children with the same key"** in `CodeAnalysisCard.tsx`. 

Das passiert, weil Listen-Items (strengths, weaknesses, securityIssues, recommendations, techStack, seoIssues) ihren Text als React `key` verwenden. Wenn die AI zwei identische Eintraege liefert (z.B. zwei gleiche Security Issues), erzeugt React doppelte Keys.

## Was bereits korrekt funktioniert

- Der Prompt in `process-analysis-queue` fordert das richtige 6-Kategorien-Format an
- `validateCodeAnalysis()` ist in beiden Edge Functions vorhanden und wird angewendet
- Realtime-Subscription in `Chat.tsx` laedt Profile automatisch neu bei Aenderungen
- Scores werden korrekt extrahiert und angezeigt (Code Quality, Security, Performance, Accessibility, Maintainability, SEO)
- Die Validierung clamped alle Scores auf 0-100

## Fix: Duplicate Keys

**Datei:** `src/components/dashboard/CodeAnalysisCard.tsx`

Alle `.map()`-Aufrufe verwenden aktuell den Item-Text als Key (`key={s}`, `key={w}`, `key={issue}`, `key={r}`, `key={t}`). Stattdessen den Index als Teil des Keys verwenden, um Duplikate zu vermeiden:

```typescript
// Vorher:
{strengths.slice(0, 5).map((s) => (
  <div key={s} ...>

// Nachher:
{strengths.slice(0, 5).map((s, i) => (
  <div key={`strength-${i}`} ...>
```

Betrifft 6 Stellen in der Datei:
1. `techStack.map((t) => ...)` -- Zeile 117
2. `strengths.slice(0, 5).map((s) => ...)` -- Zeile 133
3. `weaknesses.slice(0, 5).map((w) => ...)` -- Zeile 146
4. `securityIssues.map((issue) => ...)` -- Zeile 166
5. `seoIssues.map((issue) => ...)` -- Zeile 183
6. `recommendations.slice(0, 5).map((r) => ...)` -- Zeile 200

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/dashboard/CodeAnalysisCard.tsx` | Alle `.map()` Keys auf Index-basiert umstellen |

