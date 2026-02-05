

## Ziel
Die "Unterminated string in JSON" Fehler in `multi-ai-query` und `meta-evaluation` beheben durch einen erweiterten JSON-Sanitizer, der Strings korrekt behandelt.

---

## Root Cause Analyse

Der aktuelle `repairTruncatedJSON` macht folgendes:
```typescript
// Zählt { } [ ] und fügt fehlende am Ende hinzu
repaired += ']'.repeat(missingBrackets);
repaired += '}'.repeat(missingBraces);
```

Das Problem: **"Unterminated string"** entsteht durch:
1. **Echte Zeilenumbrüche in Strings** → `{"title": "Some\ntitle"}` ist ungültiges JSON
2. **Abgeschnittene Strings** → `{"title": "Some ti` ohne schließendes `"`

Der Bracket-Repair hilft hier nicht, weil der Parser bereits beim String-Parsing scheitert.

---

## Lösung: String-Aware JSON Sanitizer

### Schritt 1: Neue `sanitizeJsonStrings` Funktion

Eine State-Machine, die JSON durchläuft und:
- **Innerhalb von Strings** gefundene echte Control-Characters (Newline, Tab, etc.) escaped
- **Am Ende abgeschnittene Strings** mit `"` schließt

```typescript
function sanitizeJsonStrings(jsonStr: string): string {
  let result = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escaped) {
      result += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escaped = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    // Innerhalb eines Strings: Control-Characters escapen
    if (inString) {
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  // Wenn am Ende noch inString=true, schließen
  if (inString) {
    result += '"';
  }
  
  return result;
}
```

**Effekt:** Behebt beide Ursachen von "Unterminated string":
- Echte Newlines → `\n` (escaped)
- Abgeschnittene Strings → mit `"` geschlossen

---

### Schritt 2: Integration in Parsing-Pipeline

**multi-ai-query/index.ts (Zeile ~600):**

```typescript
// VORHER
try {
  parsed = JSON.parse(jsonStr);
} catch (directParseError) {
  const repairedJson = repairTruncatedJSON(jsonStr);
  parsed = JSON.parse(repairedJson);
}

// NACHHER
try {
  parsed = JSON.parse(jsonStr);
} catch (directParseError) {
  // Step 1: Sanitize strings (fix newlines + close truncated strings)
  const sanitized = sanitizeJsonStrings(jsonStr);
  
  // Step 2: Repair structure (close brackets/braces)
  const repaired = repairTruncatedJSON(sanitized);
  
  parsed = JSON.parse(repaired);
  console.log(`[${modelConfig.name}] JSON recovery SUCCEEDED for ${candidateId}`);
}
```

**meta-evaluation/index.ts (Zeile ~1460):**

Gleiche Logik für das Formatting-Parsing.

---

### Schritt 3: String-Aware Bracket Repair

Der aktuelle Bracket-Repair zählt alle `{`, `}`, `[`, `]` per Regex – auch die in Strings. Das ist falsch.

**Verbesserter Repair:**

```typescript
function repairTruncatedJSON(jsonStr: string): string {
  let repaired = jsonStr.trim();
  
  // String-aware counting (nur außerhalb von Strings zählen)
  let inString = false;
  let escaped = false;
  let openBraces = 0, closeBraces = 0;
  let openBrackets = 0, closeBrackets = 0;
  
  for (const char of repaired) {
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    
    if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') closeBraces++;
      else if (char === '[') openBrackets++;
      else if (char === ']') closeBrackets++;
    }
  }
  
  // Add missing closures
  repaired += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
  repaired += '}'.repeat(Math.max(0, openBraces - closeBraces));
  
  return repaired;
}
```

---

## Qualitätssicherung

| Aspekt | Lösung |
|--------|--------|
| **Newlines in Strings** | `sanitizeJsonStrings` escaped sie zu `\n` |
| **Abgeschnittene Strings** | `sanitizeJsonStrings` schließt mit `"` |
| **Brackets in Strings** | String-aware Repair ignoriert sie |
| **Determinismus** | Keine Heuristik, reine State-Machine |
| **Sicherheit** | Nur strukturelle Reparatur, keine Inhaltsänderung |

---

## Dateien die geändert werden

- `supabase/functions/multi-ai-query/index.ts`
  - Neue `sanitizeJsonStrings()` Funktion (~Zeile 65)
  - Verbesserter `repairTruncatedJSON()` (string-aware, ~Zeile 95)
  - Integration in Parsing-Pipeline (~Zeile 600)

- `supabase/functions/meta-evaluation/index.ts`
  - Gleiche `sanitizeJsonStrings()` Funktion
  - Gleicher string-aware `repairTruncatedJSON()`
  - Integration in Formatting-Parse (~Zeile 1460)

---

## Deployment

Nach Änderung müssen beide Edge Functions manuell zum externen Supabase (`fhzqngbbvwpfdmhjfnvk`) deployed werden.

---

## Erwartetes Ergebnis

| Fehlertyp | Vorher | Nachher |
|-----------|--------|---------|
| `Unexpected end of JSON` | ⚠️ Bracket-Repair (oft erfolgreich) | ✅ Sanitizer + Repair |
| `Unterminated string` (Newline) | ❌ Fehler → Fallback | ✅ Sanitizer escaped → Parse OK |
| `Unterminated string` (Truncation) | ❌ Fehler → Fallback | ✅ Sanitizer schließt → Parse OK |
| Brackets in Strings falsch gezählt | ⚠️ Falscher Repair | ✅ String-aware counting |

**Resultat:** Beide "Unterminated string" Varianten werden behoben, keine Error-Logs mehr.

