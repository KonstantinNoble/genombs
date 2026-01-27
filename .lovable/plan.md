
# Fix: Gemini API 404 Not Found - Korrekte Modell-IDs

## Problem-Analyse

Die Edge Function `multi-ai-query` im **externen Supabase-Projekt** (`fhzqngbbvwpfdmhjfnvk`) verwendet veraltete oder falsche Gemini Modell-IDs. Die letzten Änderungen wurden im **Lovable Cloud Backend** deployed, nicht im externen Backend wo die App tatsächlich läuft.

### Aktueller Zustand im Code:
```typescript
const MODEL_ID_MAPPING: Record<string, string> = {
  'google/gemini-3-pro-preview': 'gemini-2.5-pro-preview-05-06',  // FALSCH
  'google/gemini-2.5-flash': 'gemini-2.5-flash-preview-05-20',    // FALSCH
  'google/gemini-2.5-pro': 'gemini-2.5-pro-preview-05-06',        // FALSCH
  'google/gemini-2.5-flash-lite': 'gemini-2.0-flash-lite',        // OK
  'google/gemini-3-flash-preview': 'gemini-2.5-flash-preview-05-20', // FALSCH
};
```

### Korrekte Modell-IDs (Stand Januar 2026):

Laut Google AI Studio Dokumentation (August 2025+):

| Modell | Korrekte API-ID | Status |
|--------|-----------------|--------|
| Gemini 2.5 Pro | `gemini-2.5-pro` | Stable |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Stable |
| Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Stable (GA) |
| Gemini 2.0 Flash | `gemini-2.0-flash` | Stable |
| Gemini 2.0 Flash-Lite | `gemini-2.0-flash-lite` | Stable |

**Wichtig**: Die Preview-Versionen mit Datumssuffixen (`-preview-05-06`, `-preview-05-20`) sind veraltet und wurden durch stabile Versionen ersetzt.

---

## Lösung

### Datei: `supabase/functions/multi-ai-query/index.ts`

**Zeilen 9-22** - MODEL_ID_MAPPING aktualisieren:

```typescript
const MODEL_ID_MAPPING: Record<string, string> = {
  // OpenAI models via direct API
  'openai/gpt-5-mini': 'gpt-4o-mini',
  'openai/gpt-5': 'gpt-4o',
  'openai/gpt-5-nano': 'gpt-4o-mini',
  'openai/gpt-5.2': 'gpt-4o',
  // Google models via direct API (STABLE versions - no preview suffixes)
  'google/gemini-3-pro-preview': 'gemini-2.5-pro',      // Stabil
  'google/gemini-2.5-flash': 'gemini-2.5-flash',        // Stabil
  'google/gemini-2.5-pro': 'gemini-2.5-pro',            // Stabil
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite', // Stabil (GA)
  'google/gemini-3-flash-preview': 'gemini-2.5-flash',  // Stabil
};
```

### Zusätzlich: Fallback-Modell aktualisieren

**Zeile 340** im `queryGoogleModel` - Default-Fallback ändern:

```typescript
// Vorher:
const directModelId = MODEL_ID_MAPPING[modelConfig.id] || 'gemini-1.5-flash';

// Nachher:
const directModelId = MODEL_ID_MAPPING[modelConfig.id] || 'gemini-2.5-flash';
```

---

## Übersicht der korrigierten Mappings

| Interner Name | Vorher (404) | Nachher (korrekt) |
|---------------|--------------|-------------------|
| `google/gemini-3-pro-preview` | `gemini-2.5-pro-preview-05-06` | `gemini-2.5-pro` |
| `google/gemini-2.5-flash` | `gemini-2.5-flash-preview-05-20` | `gemini-2.5-flash` |
| `google/gemini-2.5-pro` | `gemini-2.5-pro-preview-05-06` | `gemini-2.5-pro` |
| `google/gemini-2.5-flash-lite` | `gemini-2.0-flash-lite` | `gemini-2.5-flash-lite` |
| `google/gemini-3-flash-preview` | `gemini-2.5-flash-preview-05-20` | `gemini-2.5-flash` |
| Fallback | `gemini-1.5-flash` | `gemini-2.5-flash` |

---

## Wichtiger Hinweis zum Deployment

Da du ein **externes Supabase-Projekt** verwendest:

1. Nach der Code-Änderung hier wird Lovable die Edge Function deployen
2. Diese Änderung geht an Lovable Cloud (`fdlyaasqywmdinyaivmw`)
3. **Du musst die Edge Function manuell zum externen Projekt deployen** oder die gleiche Änderung dort vornehmen

Falls du die Edge Functions über das externe Supabase-Dashboard verwaltest, musst du dort den gleichen Fix anwenden.

---

## Technischer Hintergrund

- Die Modell-IDs mit Datumssuffixen (`-preview-05-06`, `-preview-05-20`) waren temporäre Preview-Versionen
- Google hat diese durch stabile Versionen ohne Suffix ersetzt
- Die API-Endpoint-URL bleibt identisch: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- `gemini-1.5-*` Modelle wurden am 29. April 2025 deprecated
