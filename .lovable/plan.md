

## Zwei Fixes erforderlich

### Problem 1: Similarity-Threshold zu streng
**Datei:** `supabase/functions/meta-evaluation/index.ts` Zeile 295

Der aktuelle Threshold von `0.50` ist zu hoch - Empfehlungen mit ähnlichem Intent werden nicht gruppiert, daher bleibt `uniqueModels.length` fast immer 1.

**Fix:**
```typescript
// Zeile 295
threshold: number = 0.35  // Gesenkt von 0.50
```

---

### Problem 2: Falsches Gemini Model Mapping
**Datei:** `supabase/functions/meta-evaluation/index.ts` Zeilen 10-14

Das aktuelle Mapping zeigt auf veraltete Modelle:
```typescript
// FALSCH (aktuell)
'google/gemini-3-flash-preview': 'gemini-1.5-flash',  // ← 404!
'google/gemini-2.5-flash': 'gemini-1.5-flash',         // ← 404!
'google/gemini-3-pro-preview': 'gemini-1.5-pro',       // ← 404!
'google/gemini-2.5-pro': 'gemini-1.5-pro',             // ← 404!
```

**Fix:**
```typescript
// KORREKT (neu)
const GOOGLE_MODEL_MAPPING: Record<string, string> = {
  'google/gemini-3-flash-preview': 'gemini-2.5-flash',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-3-pro-preview': 'gemini-2.5-pro',
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
};
```

Und Zeile 958 Fallback-Wert:
```typescript
// VORHER
const directModelId = GOOGLE_MODEL_MAPPING['google/gemini-3-flash-preview'] || 'gemini-1.5-flash';
// NACHHER
const directModelId = GOOGLE_MODEL_MAPPING['google/gemini-3-flash-preview'] || 'gemini-2.5-flash';
```

---

## Zusammenfassung der Änderungen

| Datei | Zeile | Änderung |
|-------|-------|----------|
| `meta-evaluation/index.ts` | 11-14 | Model IDs von `1.5` auf `2.5` aktualisieren |
| `meta-evaluation/index.ts` | 295 | Threshold `0.50` → `0.35` |
| `meta-evaluation/index.ts` | 958 | Fallback `gemini-1.5-flash` → `gemini-2.5-flash` |

---

## Erwartetes Ergebnis

1. **Keine 404-Fehler mehr** bei Gemini Flash/Pro
2. **Mehr Agreement-Punkte** da ähnliche Empfehlungen bei 0.35 Threshold besser gruppiert werden
3. **uniqueModels.length >= 2** wird häufiger erreicht → "Points of Agreement" erscheint

