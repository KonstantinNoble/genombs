

## Ziel
Die "Formatting parse failed" Warnung eliminieren, sodass Premium-User den vollen LLM-polierten Output erhalten (statt nur die computed Fallbacks).

---

## Root Cause
Das Response Schema ist auf Premium-Analysen mit 13 Dissent-Items und allen Premium-Feldern zu groß. Gemini erreicht das Token-Limit (`maxOutputTokens: 6000`) und schneidet ab -> "Unterminated string".

---

## Lösung

### 1) Output-Token-Limit erhöhen
**Datei:** `supabase/functions/meta-evaluation/index.ts` (Zeile 1265)

```typescript
maxOutputTokens: 8192  // Erhöht von 6000
```

Gemini 2.5 Flash unterstützt bis zu 8192 Output-Tokens. Dies gibt mehr Raum für Premium-Inhalte.

---

### 2) Input-Prompt weiter kürzen (weniger Dissent-Items)
**Datei:** `supabase/functions/meta-evaluation/index.ts` (Zeile 1214-1218)

Aktuell werden 5 Dissent-Items gesendet, aber die vollen Descriptions können lang sein:

```typescript
// VORHER: 5 Dissents mit je 150 Zeichen Position
const dissentSummary = computedDissent.slice(0, 5).map(d => ({...}))

// NACHHER: Nur 3 Dissents mit 100 Zeichen Position
const dissentSummary = computedDissent.slice(0, 3).map(d => ({
  topic: d.topic.substring(0, 80),
  positions: d.positions.slice(0, 2).map(p => ({
    modelName: p.modelName,
    position: p.position.substring(0, 100) // Reduziert von 150
  }))
}));
```

---

### 3) Premium-Felder-Beschreibungslängen im Schema begrenzen
**Datei:** `supabase/functions/meta-evaluation/index.ts` (Zeile 990)

Gemini Schema unterstützt `maxLength` für Strings:

```typescript
competitorInsights: { type: "STRING", maxLength: 800 }
```

Und im Prompt explizit begrenzen:
```
competitorInsights: max 600 chars (STRICT)
```

---

### 4) Fallback-Robustheit verbessern: Partial Parse
**Datei:** `supabase/functions/meta-evaluation/index.ts` (Zeile 1295-1312)

Wenn der JSON incomplete ist, versuchen wir aktuell Code-Block-Recovery. Wir können zusätzlich versuchen, den JSON "zu reparieren":

```typescript
// Neuer Fallback: Truncated JSON repair
try {
  // Add missing closing brackets/braces
  let repaired = content;
  
  // Count open brackets
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  const openBrackets = (content.match(/\[/g) || []).length;
  const closeBrackets = (content.match(/]/g) || []).length;
  
  // Add missing closures
  repaired += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
  repaired += '}'.repeat(Math.max(0, openBraces - closeBraces));
  
  // Try to parse repaired JSON
  const parsed = JSON.parse(repaired);
  if (parsed && typeof parsed === 'object') {
    formattedEvaluation = parsed;
    formattingParsed = true;
    formattingParseError = 'Recovered via truncation repair';
    console.log('Recovered JSON via truncation repair');
  }
} catch {
  // Keep original error
}
```

Dies ermöglicht Partial Recovery - zumindest die vollständigen Premium-Felder am Anfang des Outputs werden nutzbar.

---

## Technische Zusammenfassung

| Änderung | Effekt |
|----------|--------|
| `maxOutputTokens: 8192` | +36% mehr Platz für Output |
| Dissent-Input von 5 auf 3 | -40% Input-Tokens |
| Position-Länge 150→100 | Weitere ~200 Token gespart |
| `maxLength: 800` für competitorInsights | Verhindert Überlauf |
| Truncation Repair | Partial Recovery bei Edge Cases |

---

## Dateien die geändert werden
- `supabase/functions/meta-evaluation/index.ts`

---

## Deployment-Hinweis
Nach Änderung muss die Edge Function manuell zum externen Supabase-Projekt (`fhzqngbbvwpfdmhjfnvk`) deployed werden, da dieses Projekt nicht Lovable Cloud sondern einen externen Backend verwendet.

---

## Testplan
1. Premium-Analyse ausführen
2. Logs prüfen: Keine "Formatting parse failed" Warnung mehr
3. Ergebnis prüfen: `strategicAlternatives` und `competitorInsights` sind gefüllt (nicht Fallback)

