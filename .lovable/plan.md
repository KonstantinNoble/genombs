

## Fix: Robusteres JSON-Parsing der KI-Antworten

### Problem

Die Funktion `parseJsonResponse` versucht nur zwei Strategien:
1. Direktes `JSON.parse()` auf den gesamten Text
2. Regex-Suche nach Markdown-Codeblocks (` ```json ... ``` `)

Wenn die KI den JSON-Output mit zusaetzlichem Text umgibt (z.B. "Here is the analysis:" vor dem JSON oder Erklaerungen danach), schlaegt beides fehl und der gesamte Job wird abgebrochen.

### Loesung

Die `parseJsonResponse`-Funktion wird erweitert um zusaetzliche Fallback-Strategien:

1. Direktes `JSON.parse` (wie bisher)
2. Markdown-Codeblock-Extraktion (wie bisher)
3. **NEU**: Erstes `{` bis letztes `}` im Text finden und diesen Substring parsen -- faengt die meisten Faelle ab, in denen die KI Text vor/nach dem JSON einfuegt

### Technische Aenderung

**Datei: `supabase/functions/process-analysis-queue/index.ts`** (Zeilen 298-308)

Vorher:
```typescript
function parseJsonResponse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("Could not parse AI response as JSON");
  }
}
```

Nachher:
```typescript
function parseJsonResponse(text: string): unknown {
  // 1. Direct parse
  try {
    return JSON.parse(text);
  } catch { /* continue */ }

  // 2. Markdown code block
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch { /* continue */ }
  }

  // 3. Extract first { ... last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  console.error("Failed to parse AI response. First 500 chars:", text.substring(0, 500));
  throw new Error("Could not parse AI response as JSON");
}
```

### Auswirkung

- Faengt den haeufigsten Fehlerfall ab (Text vor/nach dem JSON)
- Loggt den fehlgeschlagenen Text fuer zukuenftige Diagnose
- Keine Auswirkung auf korrekte Antworten (die werden weiterhin im ersten Schritt geparst)
- Nur eine Funktion in einer Datei betroffen
