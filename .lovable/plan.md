
# Plan: Gemini API Fehler basierend auf offizieller Dokumentation beheben

## Zusammenfassung

Nach Durchsicht der offiziellen Google Gemini API Dokumentation habe ich die genauen Ursachen der 404- und "Invalid JSON"-Fehler identifiziert:

1. **Falsche Modell-IDs in Fallback-Liste** - `gemini-2.0-pro` und `gemini-1.5-pro` existieren nicht
2. **Veraltete API-Version** - Dein Code nutzt teils deprecated Modelle
3. **Inkonsistente Schema-Konfiguration** - `responseMimeType` ohne `responseJsonSchema`

---

## Korrekte Modell-IDs (aus Google Docs Stand Januar 2026)

| Modell | Korrekte ID | Status |
|--------|-------------|--------|
| Gemini 2.5 Pro | `gemini-2.5-pro` | Stable |
| Gemini 2.5 Flash | `gemini-2.5-flash` | Stable |
| Gemini 2.5 Flash Lite | `gemini-2.5-flash-lite` | Stable |
| Gemini 3 Pro Preview | `gemini-3-pro-preview` | Preview |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | Preview |
| Gemini 2.0 Flash | `gemini-2.0-flash` | Deprecated (bis 31.03.2026) |

**NICHT existierende IDs** (verursachen 404):
- `gemini-2.0-pro`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

---

## Geplante Änderungen

### 1. Fallback-Kandidaten korrigieren

**Problem:** Die aktuelle `GEMINI_MODEL_CANDIDATES` enthält nicht existierende Model-IDs.

**Aktuell (falsch):**
```typescript
const GEMINI_MODEL_CANDIDATES = {
  'geminiPro': ['gemini-2.5-pro', 'gemini-2.0-pro', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  'geminiFlash': ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'],
};
```

**Korrigiert:**
```typescript
const GEMINI_MODEL_CANDIDATES = {
  'geminiPro': ['gemini-2.5-pro', 'gemini-3-pro-preview', 'gemini-2.0-flash'],
  'geminiFlash': ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
};
```

### 2. Strukturierte Ausgabe korrekt implementieren

**Problem:** `responseMimeType: "application/json"` ohne `responseJsonSchema` funktioniert nicht zuverlässig.

**Lösung gemäss Google Docs:**
```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 4096,
  responseMimeType: "application/json",
  responseJsonSchema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            confidence: { type: "number" },
            riskLevel: { type: "number" },
            creativityLevel: { type: "number" },
            reasoning: { type: "string" },
            actionItems: { type: "array", items: { type: "string" } },
            potentialRisks: { type: "array", items: { type: "string" } },
            timeframe: { type: "string" }
          },
          required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
        }
      },
      summary: { type: "string" },
      overallConfidence: { type: "number" }
    },
    required: ["recommendations", "summary", "overallConfidence"]
  }
}
```

### 3. MODEL_ID_MAPPING aktualisieren

**Problem:** Mapping auf deprecated/nicht-existente IDs.

**Korrigiert:**
```typescript
const MODEL_ID_MAPPING = {
  'google/gemini-3-pro-preview': 'gemini-2.5-pro',      // Stable für Pro-Anfragen
  'google/gemini-2.5-flash': 'gemini-2.5-flash',        // Stable
  'google/gemini-2.5-pro': 'gemini-2.5-pro',            // Stable
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
  'google/gemini-3-flash-preview': 'gemini-2.5-flash',  // Stable als Fallback
};
```

---

## Technische Details

### Datei: `supabase/functions/multi-ai-query/index.ts`

**Änderung 1 - GEMINI_MODEL_CANDIDATES (Zeile 25-28):**
```typescript
const GEMINI_MODEL_CANDIDATES: Record<string, string[]> = {
  'geminiPro': ['gemini-2.5-pro', 'gemini-3-pro-preview', 'gemini-2.0-flash'],
  'geminiFlash': ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
};
```

**Änderung 2 - JSON Schema für Gemini (in queryGoogleModel):**

Vollständiges `responseJsonSchema` hinzufügen, damit `responseMimeType: "application/json"` funktioniert:

```typescript
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          confidence: { type: "number" },
          riskLevel: { type: "number" },
          creativityLevel: { type: "number" },
          reasoning: { type: "string" },
          actionItems: { type: "array", items: { type: "string" } },
          potentialRisks: { type: "array", items: { type: "string" } },
          timeframe: { type: "string" }
        },
        required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
      }
    },
    summary: { type: "string" },
    overallConfidence: { type: "number" }
  },
  required: ["recommendations", "summary", "overallConfidence"]
};
```

**Änderung 3 - generationConfig mit Schema:**
```typescript
generationConfig: {
  temperature: 0.7,
  maxOutputTokens: 4096,
  responseMimeType: "application/json",
  responseJsonSchema: GEMINI_RESPONSE_SCHEMA
}
```

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `supabase/functions/multi-ai-query/index.ts` | Korrekte Model-IDs, vollständiges JSON Schema für Gemini |

---

## Erwartetes Ergebnis

Nach der Implementierung:
- Keine 404-Fehler mehr (nur existierende Model-IDs werden verwendet)
- Keine "Invalid JSON from request"-Fehler mehr (korrektes Schema)
- Zuverlässige strukturierte JSON-Ausgaben von Gemini
- Fallback auf Gemini 2.0 Flash als letzten Ausweg

---

## Deployment-Hinweis

Da deine App das **externe Supabase-Projekt** verwendet, musst du den aktualisierten Code manuell in dein externes Projekt kopieren und deployen.
