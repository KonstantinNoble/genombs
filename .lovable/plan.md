

# Fix: Gemini API 404 Not Found - Modell-ID Mapping aktualisieren

## Problem

Die Edge Function `multi-ai-query` verwendet veraltete Google Gemini Modell-IDs (`gemini-1.5-pro`, `gemini-1.5-flash`), die nicht mehr existieren oder nicht verfügbar sind, was zu 404-Fehlern führt.

## Lösung

Das `MODEL_ID_MAPPING` in `supabase/functions/multi-ai-query/index.ts` muss auf die aktuellen Modellnamen aktualisiert werden.

---

## Änderungen

### Datei: `supabase/functions/multi-ai-query/index.ts`

**Zeilen 9-22** - MODEL_ID_MAPPING aktualisieren:

```typescript
// Vorher (veraltet):
const MODEL_ID_MAPPING: Record<string, string> = {
  'openai/gpt-5-mini': 'gpt-4o-mini',
  'openai/gpt-5': 'gpt-4o',
  'openai/gpt-5-nano': 'gpt-4o-mini',
  'openai/gpt-5.2': 'gpt-4o',
  'google/gemini-3-pro-preview': 'gemini-1.5-pro',      // VERALTET
  'google/gemini-2.5-flash': 'gemini-1.5-flash',        // VERALTET
  'google/gemini-2.5-pro': 'gemini-1.5-pro',            // VERALTET
  'google/gemini-2.5-flash-lite': 'gemini-1.5-flash',   // VERALTET
  'google/gemini-3-flash-preview': 'gemini-1.5-flash',  // VERALTET
};

// Nachher (aktuell):
const MODEL_ID_MAPPING: Record<string, string> = {
  'openai/gpt-5-mini': 'gpt-4o-mini',
  'openai/gpt-5': 'gpt-4o',
  'openai/gpt-5-nano': 'gpt-4o-mini',
  'openai/gpt-5.2': 'gpt-4o',
  'google/gemini-3-pro-preview': 'gemini-3-pro-preview',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite-preview',
  'google/gemini-3-flash-preview': 'gemini-3-flash-preview',
};
```

---

## Übersicht der korrigierten Mappings

| Interner Name | Vorher (404) | Nachher (korrekt) |
|---------------|--------------|-------------------|
| `google/gemini-3-pro-preview` | `gemini-1.5-pro` | `gemini-3-pro-preview` |
| `google/gemini-2.5-flash` | `gemini-1.5-flash` | `gemini-2.5-flash` |
| `google/gemini-2.5-pro` | `gemini-1.5-pro` | `gemini-2.5-pro` |
| `google/gemini-2.5-flash-lite` | `gemini-1.5-flash` | `gemini-2.5-flash-lite-preview` |
| `google/gemini-3-flash-preview` | `gemini-1.5-flash` | `gemini-3-flash-preview` |

---

## Technischer Hintergrund

Die Google Generative Language API (`generativelanguage.googleapis.com`) erwartet exakte Modellnamen. Die alten `gemini-1.5-*` Modelle wurden durch neuere Versionen ersetzt:

- **Gemini 2.5** ist jetzt Generally Available (GA)
- **Gemini 3** ist als Preview verfügbar
- Die Endpunkt-URL bleibt identisch: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

---

## Auswirkung

Nach dieser Änderung:
- Alle Gemini-Modellabfragen werden erfolgreich sein
- Die Multi-AI Validation Platform kann wieder alle Google-Modelle nutzen
- Keine Änderungen an der UI oder anderen Edge Functions erforderlich

