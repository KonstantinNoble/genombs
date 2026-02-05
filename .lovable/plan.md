
## Ziel
- **Keine “Failed to parse formatted evaluation …” Errors** mehr (oder maximal als Warnung + sauberer Fallback).
- **“Points of Agreement” soll wieder realistisch gefüllt werden**, d.h. semantisch ähnliche Empfehlungen über 2+ Modelle werden zuverlässiger als Agreement erkannt (ohne dass das LLM die Existenz von Agreements “erfindet”).
- Wenn es *wirklich* 0 Agreements gibt, soll das **nachvollziehbar** sein (Debug-Signale), statt wie ein Bug zu wirken.

---

## Was die aktuellen Logs bedeuten
1) **Parse-Error**:  
`SyntaxError: Unterminated string in JSON …` heißt: Der Formatting-Output vom Gemini-Call ist **kein vollständig valides JSON** (häufig wegen **Truncation** durch Tokenlimit oder wegen nicht korrekt escapten Strings).

2) **0 Agreements** ist aktuell **nicht durch den Parse-Error verursacht**, denn die deterministische Berechnung zeigt:
- `consensusCount: 0`, `dissentCount: 13`
- `Final classification: 0 agreements, 13 dissents`

Das bedeutet: Die Agreement-Erkennung findet **keine Cross-Model-Cluster** (zu strenge Similarity/Heuristik oder tatsächlich sehr unterschiedliche Empfehlungen).

---

## Umsetzung (Code-Änderungen)

### 1) Formatting-Step so umbauen, dass er garantiert parsebar bleibt
**Datei:** `supabase/functions/meta-evaluation/index.ts` (Step 3)

**1.1 Structured Output mit Schema aktivieren**
- Beim Google-Gemini REST Call zusätzlich zu `responseMimeType: "application/json"` ein **`generationConfig.responseSchema`** setzen.
- Dafür nutzen wir das vorhandene Schema aus `getFormattingTool(isPremium).function.parameters`, aber konvertieren die `type`-Werte auf das Gemini-Schemaformat (z.B. `OBJECT/ARRAY/STRING/NUMBER` statt `object/array/string/number`), damit der REST-Endpunkt es akzeptiert.

**1.2 Token-Truncation vermeiden**
- Der JSON-Output wird vermutlich abgeschnitten (→ “unterminated string”). Fix:
  - **Prompt drastisch verkleinern**: Im Formatting-Schritt nicht mehr die komplette `computedDissent`-Struktur + lange Reasonings senden.
  - Stattdessen nur das, was fürs “Polishen” nötig ist:  
    - `computedFinal` (title/description/topActions)  
    - optionale kurze Liste der Consensus Topics (nur topic + 1 Satz)  
    - `modelSummaries` (ggf. gekürzt)  
    - `businessContext` (falls vorhanden)
- Zusätzlich:
  - `maxOutputTokens` auf einen Wert setzen, der **zur Output-Größe passt** (und Output-Länge in der Prompt-Instruktion begrenzen, z.B. competitorInsights max ~1200 chars).

**1.3 Parse-Fehler entdramatisieren & besser debuggen**
- Wenn JSON.parse trotzdem fehlschlägt:
  - statt `console.error` → `console.warn` (damit keine “error”-Logs die Observability zumüllen)
  - `_debug` erweitern um:
    - `formattingFinishReason`
    - `formattingUsage` (tokens falls vorhanden)
    - `formattingContentLength`
- Ergebnis bleibt stabil: computed + Premium-Fallbacks, ohne harte Failure.

**1.4 API Key Konsistenz**
- Den Gemini REST Call auf Header-Auth umstellen: `x-goog-api-key` (statt `?key=`), wie in den robusteren Patterns üblich.

---

### 2) Agreement-Erkennung verbessern (damit “0 agreements” nicht fast immer passiert)
**Datei:** `supabase/functions/meta-evaluation/index.ts` (clustering + similarity)

Aktuell entstehen nur Single-Model-Cluster → wir machen Matching “smarter”, aber ohne LLM als Quelle der Wahrheit.

**2.1 Similarity-Signal verbessern**
- Zusätzlich zur Title-Similarity auch **Description-Similarity** berücksichtigen:
  - Keywords aus `title + description` (gekürzt) extrahieren
  - Jaccard berechnen
  - `calculateCombinedSimilarity` wird z.B. `max(titleSim, intentSim, descSim)`

**2.2 Thresholds & Penalties feinjustieren**
- Aktueller Default `threshold=0.35` + Penalty (same action, diff target) kann zu aggressiv sein.
- Anpassung:
  - leicht niedrigerer Haupt-Threshold (z.B. 0.32)
  - Fallback-Threshold runter (z.B. 0.24)
  - Penalty-Faktor weniger hart (z.B. 0.8 statt 0.6), damit semantisch ähnliche Titel nicht “wegpenalized” werden.

**2.3 “Loose Pass” nur für Cross-Model (kontrolliert, um False Positives zu begrenzen)**
Wenn nach Fallback immer noch keine Multi-Model-Cluster existieren:
- Extra Pass nur für Paare **aus unterschiedlichen Modellen**, Union wenn:
  - gleiche kanonisierte Action (aus `extractActionTarget`) **und**
  - (mind. 1 gemeinsames kanonisiertes Keyword **oder** `intentSim` über kleinem Grenzwert)
So bekommst du Agreements, wenn Modelle zwar anders formulieren, aber das gleiche “Do X to Y”-Intent haben.

**2.4 Bessere Mehrsprachigkeit (de/en)**
- `STOP_WORDS` um gängige deutsche Stopwords erweitern (und, der, die, das, ein, eine, etc.)
- `CANONICAL_TOKENS` um deutsche Synonyme erweitern:
  - umsetzen/implementieren → implement
  - erstellen/aufbauen → build
  - starten/launchen → launch
  - skalieren → scale
  - validieren/prüfen → validate
Damit sinkt “Sprach-Drift” als Ursache für 0 Agreements.

**2.5 Debug-Ausgaben, die direkt zeigen, warum es 0 Agreements war**
- Schon vorhanden: `Top 10 cross-model similarity pairs`
- Ergänzen:
  - `maxCrossModelSimilarity`
  - `crossModelPairsAboveThresholdCount`
  - Ergebnis nach strict/fallback/loose pass
Damit kann man sofort sehen, ob es “wirklich keine Nähe” gab oder nur Threshold zu hoch war.

---

### 3) (Optional, falls du es möchtest) UI-Text weniger “wie ein Bug” klingen lassen
**Datei:** `src/components/validation/ConsensusSection.tsx`

Wenn trotz allem 0 Agreements vorkommen (kann legit sein), Text anpassen zu:
- “No high-confidence overlaps detected. Models may still align on broader themes.”
Das verhindert, dass korrekte 0er wie ein Fehler wirken.

---

## Abhängigkeiten / Rollout-Hinweis (wichtig)
Dein Frontend nutzt **`src/lib/supabase/external-client.ts`** und ruft die Backend-Funktionen über `${SUPABASE_URL}/functions/v1/...` auf.  
Das heißt: Die Änderungen müssen in genau der Backend-Umgebung deployed werden, auf die diese URL zeigt (sonst siehst du weiter die alten Effekte).

---

## Testplan (End-to-End)
1) Premium-Analyse erneut ausführen (derselbe Prompt wie in den Logs).
2) Erwartung:
   - Keine JSON-Parse-Errors mehr (oder nur Warnung + `_debug` zeigt truncation sauber).
   - Agreements erscheinen häufiger (wenn es semantische Overlaps gibt).
3) Wenn Agreements immer noch 0:
   - `_debug` + “Top 10 cross-model similarity pairs” prüfen:
     - Wenn maxSimilarity sehr niedrig: dann gibt es wirklich kaum overlap.
     - Wenn maxSimilarity moderat/hoch, aber 0 Agreements: dann ist es ein Clustering/Guardrail-Bug → gezielt nachjustieren.

---

## Risiko / Trade-off
- Niedrigere Thresholds können **False Positives** erhöhen (unterschiedliche Empfehlungen werden zusammengezogen).
- Deshalb: “Loose Pass” nur Cross-Model + zusätzliche Constraints (Action match + Keyword/Intent Match), und Debug-Transparenz.

---

## Dateien, die betroffen sein werden
- `supabase/functions/meta-evaluation/index.ts` (Hauptfix: Formatting + Agreement-Detection)
- optional: `src/components/validation/ConsensusSection.tsx` (nur Copy-Verbesserung)
