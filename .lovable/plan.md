
## Ziel
Die "Unexpected end of JSON input" Fehler in `multi-ai-query` beheben durch präventive Schema-Constraints und robuste Truncation-Recovery.

---

## Root Cause
Das Problem tritt im `queryGoogleModel` bei Line 568 auf:
- Gemini gibt großes JSON zurück (4096 maxOutputTokens)
- Wenn Response truncated wird, ist das JSON unvollständig: `{"recommendations": [{"title": "..."`
- `JSON.parse()` schlägt fehl mit "Unexpected end of JSON input"
- Alle Kandidaten (gemini-2.5-pro, gemini-2.5-flash, etc.) fail → error wird returnt

**Fehler aus Logs:**
```
[Gemini 3 Pro] Failed to parse JSON from gemini-2.5-pro: SyntaxError: Unexpected end of JSON input
[Gemini Flash] Failed to parse JSON from gemini-2.5-flash: SyntaxError: Unexpected end of JSON input
```

---

## Lösung: 3-Schritte-Fix (ähnlich wie meta-evaluation)

### Schritt 1: maxLength-Constraints im GEMINI_RESPONSE_SCHEMA (Zeile 33-63)

Aktuell hat das Schema **keine maxLength-Felder**. Das muss sich ändern:

```typescript
// VORHER
title: { type: "string" }
description: { type: "string" }
reasoning: { type: "string" }
actionItems: { type: "array", items: { type: "string" } }
// ... etc

// NACHHER
title: { type: "string", maxLength: 120 }
description: { type: "string", maxLength: 300 }
reasoning: { type: "string", maxLength: 250 }
actionItems: { type: "array", items: { type: "string", maxLength: 150 } }
potentialRisks: { type: "array", items: { type: "string", maxLength: 120 } }
competitiveAdvantage: { type: "string", maxLength: 200 }
longTermImplications: { type: "string", maxLength: 250 }
resourceRequirements: { type: "string", maxLength: 250 }
summary: { type: "string", maxLength: 500 }
marketContext: { type: "string", maxLength: 400 }
strategicOutlook: { type: "string", maxLength: 400 }
```

**Effekt:** Gemini wird verpflichtet, kleinere Felder zu generieren → weniger Truncation-Risiko

---

### Schritt 2: Neue Repair-Funktion vor queryGoogleModel (Zeile ~388)

Neue Helper-Funktion für robuste JSON-Reparatur bei Truncation:

```typescript
// Helper: Repair truncated JSON by closing unclosed braces/brackets
function repairTruncatedJSON(jsonStr: string): string {
  let repaired = jsonStr;

  // Count opening and closing brackets/braces
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;

  // Add missing closing brackets first (from innermost)
  repaired += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
  
  // Then add missing closing braces
  repaired += '}'.repeat(Math.max(0, openBraces - closeBraces));

  return repaired;
}
```

---

### Schritt 3: Robust JSON Parsing in queryGoogleModel (Zeile 541-574)

Modifiziere die JSON-Extraktion, um Truncation-Repair zu nutzen:

**VORHER (Zeile 541-574):**
```typescript
let parsed;
try {
  let jsonStr = content.trim();
  
  // Pattern 1: ```json ... ```
  const jsonCodeBlock = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonCodeBlock) {
    jsonStr = jsonCodeBlock[1].trim();
  } else {
    // ... other patterns
  }
  
  parsed = JSON.parse(jsonStr);  // ← FAILS on truncated JSON
} catch (parseError) {
  console.error(`[${modelConfig.name}] Failed to parse JSON from ${candidateId}:`, parseError);
  lastError = "Invalid JSON response from model";
  continue;
}
```

**NACHHER:** Mit Repair-Fallback

```typescript
let parsed;
try {
  let jsonStr = content.trim();
  
  // Pattern 1: ```json ... ```
  const jsonCodeBlock = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonCodeBlock) {
    jsonStr = jsonCodeBlock[1].trim();
  } else {
    // ... other patterns
  }
  
  // First attempt: Direct parse
  try {
    parsed = JSON.parse(jsonStr);
  } catch (directParseError) {
    // Second attempt: Repair truncated JSON and retry
    console.log(`[${modelConfig.name}] Direct parse failed, attempting truncation repair...`);
    const repairedJson = repairTruncatedJSON(jsonStr);
    parsed = JSON.parse(repairedJson);  // ← Retry with repaired JSON
  }
} catch (parseError) {
  console.error(`[${modelConfig.name}] Failed to parse JSON from ${candidateId}:`, parseError);
  console.log(`[${modelConfig.name}] Raw content (first 500 chars):`, content.substring(0, 500));
  lastError = "Invalid JSON response from model";
  continue;
}
```

---

## Qualitätssicherung

| Aspekt | Lösung |
|--------|--------|
| **Präventiv** | maxLength im Schema reduziert Truncation-Wahrscheinlichkeit |
| **Robust** | Repair-Fallback schließt abgeschnittene Strukturen |
| **Sicher** | Kein String-Manipulations-Code (nur strukturelle Brackets) |
| **Transparent** | Logging zeigt wenn Repair triggert |
| **Fallback-Chain** | Immer noch alle Kandidaten probieren |

---

## Dateien zu ändern
- `supabase/functions/multi-ai-query/index.ts`
  - GEMINI_RESPONSE_SCHEMA (Zeile 33-63): maxLength Constraints hinzufügen
  - Neue Funktion `repairTruncatedJSON()` (vor Line 388)
  - queryGoogleModel JSON-Parsing (Line 541-574): Repair-Logik integrieren

---

## Deployment
Nach Änderung muss die Edge Function manuell zum externen Supabase (`fhzqngbbvwpfdmhjfnvk`) deployed werden.

---

## Erwartetes Ergebnis

| Szenario | Vorher | Nachher |
|----------|--------|---------|
| Normales Response (vollständig) | ✅ Parse erfolg | ✅ Parse erfolg (unverändert) |
| Truncated Response (abgeschnitten) | ❌ Parse Error → nächster Kandidat | ✅ Repair → Parse erfolg |
| Alle Kandidaten truncated | ❌ Error zurückgeben | ⚠️ Besser: Repair über alle Kandidaten |
| maxLength beachtet | ❌ Große Felder | ✅ Kleinere, safer Responses |

**Resultat:** Keine "Unexpected end of JSON input" Fehler mehr bei truncated Responses.
