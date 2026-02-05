

## Ziel
Behebung der "Formatting parse failed" Warnung durch sichere, kontextbasierte Premium-Fallbacks – ohne unsicheren String-Repair-Code.

---

## Status quo (aus last-diff ✅ ALREADY DONE)

Folgende Optimierungen wurden bereits implementiert:

| Change | Zeilen | Status |
|--------|--------|--------|
| `competitorInsights: { type: "STRING", maxLength: 800 }` | ~990 | ✅ |
| Prompt mit expliziten maxLength-Hints | ~1200-1210 | ✅ |
| Dissent-Reduktion: 5 → 3 Items | ~1214 | ✅ |
| Position-Länge: 150 → 100 Zeichen | ~1221 | ✅ |
| `maxOutputTokens: 6000` → `8192` | ~1266 | ✅ |
| Fallback 1: Code-Block-Extraktion | ~1303-1312 | ✅ |
| Fallback 2: Bracket-Repair (strukturell) | ~1313-1345 | ✅ |

**Diese Maßnahmen reduzieren Truncation deutlich, aber verhindern sie nicht zu 100%.**

---

## Problem: Statische Premium-Fallbacks sind immer noch aktiv

**Zeilen 1400-1430:** Die aktuelle Merge-Logik verwendet immer noch **hardcodierte generische Defaults**:

```typescript
strategicAlternatives: formattedEvaluation?.strategicAlternatives?.length > 0 
  ? formattedEvaluation.strategicAlternatives 
  : [
      {
        scenario: "Conservative Approach",  // ← GENERISCH
        pros: ["Lower risk exposure", ...],  // ← GENERISCH
        ...
      },
      { scenario: "Aggressive Growth", ... }  // ← GENERISCH
    ]
```

**Problem:** Wenn Formatting fehlschlägt, bekommt Premium-User generische Inhalte statt kontextspezifischer Fallbacks.

---

## Lösung: 3 Schritte zur Implementierung

### Schritt 1: Neue Helper-Funktionen hinzufügen (vor Gemini-Call, ~Zeile 880)

Drei neue Funktionen zur Generierung kontextbasierter Fallbacks aus `computed`-Daten:

```typescript
// Generiere Szenarien basierend auf echten Consensus + Dissent Punkten
function generateContextualAlternatives(
  consensusItems: ComputedConsensus[],
  dissentItems: ComputedDissent[],
  finalRec: ComputedFinal
): any[] {
  // Szenario 1: "Consensus Path" aus Top-Consensus
  // Szenario 2: "Dissent-Driven Path" aus Top-Dissent (falls vorhanden)
  // Basiert auf echten Daten, nicht Hardcodes
}

// Generiere 6/12-Monats-Outlook basierend auf finaler Empfehlung
function generateContextualOutlook(
  finalRec: ComputedFinal,
  riskContext: string
): any {
  // sixMonths: Aktualisierte Skalierungsstrategie
  // twelveMonths: Langfristige Perspektive basierend auf Confidence
  // keyMilestones: Aktuelle Action-Items als Meilensteine
}

// Generiere Wettbewerbs-Insights aus Model-Zusammenfassungen
function generateContextualInsights(
  modelSummaries: string[],
  consensusTopics: string[]
): string {
  // Analysiert Model-Unterschiede und Consensus-Punkte
  // Erzeugt kontextspezifische, nicht generische Texte
}
```

**Effekt:** Diese Funktionen nutzen die echten Daten (`computedConsensus`, `computedDissent`, `computedFinal`), die **IMMER** verfügbar sind, egal ob Formatting fehlschlägt.

---

### Schritt 2: Merge-Logik aktualisieren (Zeilen 1400-1430)

**VORHER:** Statische Defaults

```typescript
strategicAlternatives: formattedEvaluation?.strategicAlternatives?.length > 0 
  ? formattedEvaluation.strategicAlternatives 
  : [{ scenario: "Conservative Approach", ... }]
```

**NACHHER:** Kontextbasierte Fallbacks

```typescript
strategicAlternatives: formattedEvaluation?.strategicAlternatives?.length > 0 
  ? formattedEvaluation.strategicAlternatives 
  : generateContextualAlternatives(computedConsensus, computedDissent, computedFinal)

longTermOutlook: formattedEvaluation?.longTermOutlook 
  ? formattedEvaluation.longTermOutlook 
  : generateContextualOutlook(computedFinal, riskContext)

competitorInsights: formattedEvaluation?.competitorInsights 
  ? formattedEvaluation.competitorInsights 
  : generateContextualInsights(
      modelResponses.map(m => m.summary || "").filter(s => s),
      computedConsensus.map(c => c.topic)
    )
```

**Effekt:** Premium-User erhalten immer personalisierte Insights – nicht generische Texte.

---

### Schritt 3: Logging aktualisieren (Zeile ~1444)

Erhöhe die Transparenz, wann Fallbacks greifen:

```typescript
if (isPremium) {
  const usingContextualFallbacks = !formattedEvaluation?.strategicAlternatives?.length 
    || !formattedEvaluation?.longTermOutlook?.sixMonths 
    || !formattedEvaluation?.competitorInsights;

  console.log('Premium features status:', {
    strategicAlternativesFromLLM: !!formattedEvaluation?.strategicAlternatives?.length,
    longTermOutlookFromLLM: !!formattedEvaluation?.longTermOutlook?.sixMonths,
    competitorInsightsFromLLM: !!formattedEvaluation?.competitorInsights,
    usingContextualFallbacks
  });
}
```

---

## Technische Details der neuen Funktionen

### `generateContextualAlternatives()`

**Input:** 
- `consensusItems`: Aus `computedConsensus` (echte Agreement-Punkte)
- `dissentItems`: Aus `computedDissent` (echte Dissent-Punkte)
- `finalRec`: Aus `computedFinal` (finale Empfehlung)

**Output:** Array mit 2-3 Szenarien

**Beispiel:**
```
Szenario 1: "Consensus Path"
- Scenario: "Consensus Path"
- Description: Nutzt top agreement point
- Pros: ["Supported by X models", "Highest confidence"]
- Cons: ["May miss alternatives"]

Szenario 2: "Dissent-Driven Approach"
- Scenario: "Explore minority perspective"
- Description: Nutzt top dissent topic
- Pros: ["Challenges assumptions", "Increases robustness"]
- Cons: ["Higher risk", "Single model support"]
```

### `generateContextualOutlook()`

**Input:** 
- `finalRec`: Finale Empfehlung
- `riskContext`: User's Risk-Preference

**Output:** `{ sixMonths, twelveMonths, keyMilestones }`

**Logik:**
- `sixMonths`: Basierend auf finalRec description + first action item
- `twelveMonths`: Scale/optimize die Lösung, basierend auf Confidence
- `keyMilestones`: Nutzt die Top 3 Action-Items

### `generateContextualInsights()`

**Input:** 
- `modelSummaries`: Array von Model-Zusammenfassungen
- `consensusTopics`: Echte Consensus-Themen

**Output:** String (~400-600 Zeichen)

**Logik:**
- Fasst zusammen, welche Modelle was empfohlen haben
- Erwähnt die Top Consensus-Punkte
- Hebt Unterschiede hervor

---

## Qualitätssicherung

| Aspekt | Sicherheit |
|--------|-----------|
| **Determinismus** | Alle Fallbacks nutzen echte computed-Daten, nicht Halluzinationen |
| **Robustheit** | `computed` ist IMMER verfügbar, egal ob Gemini/JSON fehlschlägt |
| **Fehlerbehandlung** | Strukturelles Bracket-Repair schlägt gracefully zu Fallback |
| **Logging** | Transparent, wann Fallbacks greifen + warum |
| **Kein unsicherer Code** | Kein String-Manipulations-Code (Quote-Zählung), nur strukturelle JSON-Recovery |

---

## Dateien die geändert werden
- `supabase/functions/meta-evaluation/index.ts`
  - Neue Funktionen hinzufügen (~Zeile 880)
  - Merge-Logik aktualisieren (~Zeile 1400-1430)
  - Logging verbessern (~Zeile 1444)

---

## Deployment
Nach Änderung muss die Edge Function manuell zum externen Supabase (`fhzqngbbvwpfdmhjfnvk`) deployed werden.

---

## Erwartetes Ergebnis

| Szenario | Vorher | Nachher |
|----------|--------|---------|
| LLM erfolgreich | Premium-Content von Gemini ✅ | Premium-Content von Gemini ✅ |
| JSON truncated (Bracket-Repair greift) | Partial LLM-Content ⚠️ | Partial LLM-Content + Fallback ✅ |
| Parse komplett fehlgeschlagen | Generische statische Texte ❌ | Kontextbasierte, personalisierte Fallbacks ✅ |

**Resultat:** Premium-User sehen IMMER sinnvolle, kontextspezifische Inhalte – nie generische Defaults.

