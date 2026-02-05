

## Ziel
Entfernung der statischen/kontextbasierten Fallback-Inhalte, die die Warning-Logs auslösen. Stattdessen: Wenn LLM-Parsing fehlschlägt, werden Premium-Felder einfach leer gelassen oder mit `null` gefüllt, anstatt Ersatzinhalte zu generieren.

---

## Problem: Warum Warnungen weiterhin auftreten

Die Warnungen entstehen an diesen Stellen:

| Datei | Zeile | Warning |
|-------|-------|---------|
| `meta-evaluation/index.ts` | 1569 | `Formatting parse failed (trying recovery)` |
| `meta-evaluation/index.ts` | 1603 | `Sanitize+repair failed (using computed fallback)` |
| `multi-ai-query/index.ts` | 689 | `Failed to parse JSON from ... (even after sanitize+repair)` |

Das Problem: Selbst wenn die Recovery fehlschlägt, werden danach kontextbasierte Fallbacks generiert (Zeilen 1662-1676), was die Warnungen NICHT verhindert - sie zeigt nur an, dass LLM-Parsing nicht funktioniert hat.

---

## Lösung: Vereinfachte Architektur

### Änderung 1: `meta-evaluation/index.ts` - Fallback-Funktionen entfernen

**Entfernen (Zeilen 114-275):**
- `generateContextualAlternatives()` 
- `generateContextualOutlook()`
- `generateContextualInsights()`

Diese Funktionen sind nicht mehr notwendig, wenn wir keine Fallbacks mehr generieren.

---

### Änderung 2: `meta-evaluation/index.ts` - Premium-Merge vereinfachen

**VORHER (Zeilen 1661-1676):**
```typescript
...(isPremium && {
  strategicAlternatives: formattedEvaluation?.strategicAlternatives?.length > 0 
    ? formattedEvaluation.strategicAlternatives 
    : generateContextualAlternatives(...),  // ← FALLBACK
  longTermOutlook: formattedEvaluation?.longTermOutlook?.sixMonths 
    ? formattedEvaluation.longTermOutlook 
    : generateContextualOutlook(...),  // ← FALLBACK
  competitorInsights: formattedEvaluation?.competitorInsights 
    || generateContextualInsights(...)  // ← FALLBACK
})
```

**NACHHER:**
```typescript
...(isPremium && {
  strategicAlternatives: formattedEvaluation?.strategicAlternatives || null,
  longTermOutlook: formattedEvaluation?.longTermOutlook || null,
  competitorInsights: formattedEvaluation?.competitorInsights || null
})
```

**Effekt:** Wenn LLM-Parsing fehlschlägt, sind Premium-Felder `null`. UI muss das behandeln (z.B. "Premium insights unavailable" anzeigen).

---

### Änderung 3: Warning-Logs auf Info-Level reduzieren

Da wir jetzt akzeptieren, dass Parsing manchmal fehlschlägt (ohne Fallback-Generierung), sollten die Logs nicht mehr als `console.warn` sondern als `console.log` mit Info-Level erscheinen.

**Zeile 1569:**
```typescript
// VORHER
console.warn('Formatting parse failed (trying recovery):', formattingParseError);

// NACHHER  
console.log('[Formatting] Initial parse failed, trying recovery:', formattingParseError);
```

**Zeile 1603:**
```typescript
// VORHER
console.warn('Sanitize+repair failed (using computed fallback):', ...);

// NACHHER
console.log('[Formatting] Recovery failed, continuing without premium polish:', ...);
```

---

### Änderung 4: `multi-ai-query/index.ts` - Log-Level anpassen

**Zeile 689:**
```typescript
// VORHER
console.error(`[${modelConfig.name}] Failed to parse JSON from ${candidateId} (even after sanitize+repair):`, parseError);

// NACHHER
console.log(`[${modelConfig.name}] JSON parse failed for ${candidateId} (continuing to next candidate):`, parseError);
```

**Zeile 677:**
```typescript
// VORHER
console.log(`[${modelConfig.name}] Direct parse failed for ${candidateId}, attempting sanitize + repair...`);

// NACHHER (bereits OK, kein change nötig)
```

---

## Frontend-Anpassung (optional, falls nötig)

Falls das Frontend die Premium-Felder erwartet, muss es `null`-Werte behandeln können:

| Feld | Wenn `null` | UI-Verhalten |
|------|-------------|--------------|
| `strategicAlternatives` | Keine Alternativen anzeigen | Sektion ausblenden oder "AI analysis unavailable" |
| `longTermOutlook` | Keine Prognose | Sektion ausblenden |
| `competitorInsights` | Keine Wettbewerbsanalyse | Sektion ausblenden |

---

## Dateien die geändert werden

- `supabase/functions/meta-evaluation/index.ts`
  - Entfernen: `generateContextualAlternatives()`, `generateContextualOutlook()`, `generateContextualInsights()` (Zeilen 114-275)
  - Vereinfachen: Premium-Merge-Logik (Zeilen 1661-1676)
  - Log-Level ändern: `warn` → `log` (Zeilen 1569, 1603)
  - Logging für Premium-Status vereinfachen (Zeilen 1689-1700)

- `supabase/functions/multi-ai-query/index.ts`
  - Log-Level ändern: `error` → `log` (Zeile 689)

---

## Erwartetes Ergebnis

| Szenario | Vorher | Nachher |
|----------|--------|---------|
| LLM-Parsing erfolgreich | Premium-Content vom LLM | Premium-Content vom LLM (unverändert) |
| LLM-Parsing fehlgeschlagen | Warning + Kontextbasierte Fallbacks | Info-Log + Premium-Felder = `null` |
| Log-Level | `warn`/`error` (erscheint in Error-Ansicht) | `log` (nur in Debug-Ansicht) |

**Resultat:** 
- Keine Warning/Error-Logs mehr für Parsing-Fehlschläge
- Vereinfachte Code-Architektur (weniger Fallback-Logik)
- UI zeigt "Premium unavailable" statt generierter Inhalte

