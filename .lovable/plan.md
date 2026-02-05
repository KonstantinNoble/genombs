
## Beobachtung (aus deinem Log)
In `meta-evaluation` ist die neue Klassifizierung bereits aktiv (Agreement wäre **>= 2 Modelle pro Gruppe**). Trotzdem kommt:

- `consensusCount: 0`
- `dissentCount: 7`

Das heißt nicht “UI-Bug”, sondern: **Kein einziges Topic-Cluster enthält Empfehlungen von mindestens 2 unterschiedlichen Modellen.**  
Der Similarity-Threshold wurde zwar auf `0.35` gesenkt, aber die Gruppierung findet weiterhin kaum/keine Cross-Model-Matches.

---

## Wahrscheinlichste Ursachen (Code-basiert)
### A) Order-Bias in der Gruppierung (sehr wahrscheinlich)
Aktuell wird sequentiell in eine `Map<title, recs[]>` gruppiert:

- Eine Gruppe wird durch den **ersten Titel** (`groupTitle`) “repräsentiert”.
- Neue Titel werden **nur** gegen diese Group-Keys verglichen (nicht gegen alle Titel innerhalb der Gruppe).
- Dadurch kann ein “Similarity-Ketteneffekt” verloren gehen:

Beispiel:
- Titel A ~ Titel B (0.40)
- Titel B ~ Titel C (0.40)
- Titel A !~ Titel C (0.30)

Mit deiner aktuellen Logik kann C **nicht** in die Gruppe kommen, obwohl es über B semantisch “verbunden” wäre. Ergebnis: **zu viele 1-Model-Gruppen**.

### B) Title-only Matching ist zu schwach (wahrscheinlich)
Die Similarity nutzt nur `rec.title`. Wenn Modelle denselben Inhalt anders “betiteln”, aber in Description/ActionItems sehr ähnlich sind, erkennt das System keine Übereinstimmung.

### C) Canonicalization/Verb-Liste deckt Marketing-Formulierungen + DE/EN-Mix nicht gut ab (möglich)
`normalizeText()` lässt nur `[a-z0-9]` zu. Bei nicht-englischen Zeichen/Sprachen kann das Keywords “kaputt-normalisieren”. Außerdem ist die Synonym-Abdeckung in `CANONICAL_TOKENS` begrenzt (z.B. “utilize/leverage/adopt” etc.).

---

## Vorgehen zur Verifikation (ohne Ratespiel)
Wir bauen gezielte Debug-Logs in `meta-evaluation` ein, damit du in den Backend-Logs sofort siehst, was passiert:

1) **Active Models & Rec-Counts** (pro Modell)
- Modellname
- #Recommendations
- 2–3 Beispiel-Titel

2) **Cross-Model Similarity Stats**
- Für jede Empfehlung: `maxSimilarityToOtherModel`
- Top 10 Paarungen (modelA/titleA ↔ modelB/titleB) mit Similarity-Score

Erwartung:
- Wenn die Top Cross-Model Similarities fast immer < 0.35 sind: Threshold/Features müssen verbessert werden.
- Wenn viele Scores > 0.35 existieren, aber trotzdem keine Gruppen entstehen: dann ist es sehr wahrscheinlich **Order-Bias/Grouping-Implementierung**.

---

## Implementations-Änderungen (Fix)
### 1) Order-unabhängige Clusterbildung (Hauptfix)
Wir ersetzen die aktuelle “Map + first-title-key” Logik durch eine deterministische, order-unabhängige Clustering-Variante:

- Baue alle Recommendations in eine Liste `allRecs`.
- Berechne paarweise Similarities (O(n²), bei typischen 6–15 recs absolut ok).
- Nutze **Union-Find** (Disjoint Set) oder BFS über einen Similarity-Graph:
  - Kante zwischen i und j, wenn `similarity(i,j) >= threshold`
  - Cluster = zusammenhängende Komponente

Damit werden “Ketten-Ähnlichkeiten” korrekt zu einem Cluster zusammengefasst.

### 2) Besseres Similarity-Feature: Title + ActionItems (und optional Description)
Wir definieren eine “Intent-Signatur” pro Recommendation:
- Textbasis: `title + " " + actionItems.slice(0,2).join(" ")` (optional + `description`)
- Daraus canonical keywords extrahieren (wie bisher)

Similarity dann z.B.:
- `titleSim = calculateEnhancedSimilarity(titleA, titleB)`
- `intentSim = jaccard(canonicalKeywords(intentTextA), canonicalKeywords(intentTextB))`
- `finalSim = Math.max(titleSim, intentSim)`

Damit matchen Modelle, die denselben Schritt vorschlagen, aber anders betiteln.

### 3) Optional: Adaptive Fallback (nur wenn weiterhin 0 Agreements)
Wenn nach Clusterbildung `consensus.length === 0` aber **>=2 Modelle** aktiv sind:
- zweite Pass-Runde mit leicht niedrigerem Threshold (z.B. 0.28–0.30)
- Guardrail gegen “False Agreements”: mindestens 2 gemeinsame nicht-generische Keywords

### 4) Canonicalization erweitern (gezielt, nicht wild)
- Ergänze `CANONICAL_TOKENS` um häufige Synonyme:
  - use/utilize/leverage/adopt → `use`
  - social/instagram/reels etc. optional nicht nötig, aber “use/leverage” hilft
- Optional: normalizeText Unicode-freundlich machen (wichtig falls DE/FR/… in Titles):
  - statt nur `[a-z0-9]` → Unicode Letter/Number Klassen behalten

---

## Dateien, die wir ändern würden
- `supabase/functions/meta-evaluation/index.ts`
  - Debug-Logging
  - neue Clustering-Implementierung (Union-Find / Graph Components)
  - Similarity auf Intent-Signatur erweitern
  - optional: adaptive Threshold-Fallback + canonicalization tweaks

Frontend muss dafür nicht geändert werden, weil es bereits korrekt “Empty State” zeigt.

---

## Akzeptanzkriterien (was du danach sehen solltest)
1) In Logs:
   - `Semantic grouping: X recommendations -> Y topic groups` wird ersetzt/ergänzt durch Cluster-Logs
   - Mindestens einige Logs wie: `Partial consensus: ... - 2/3 models`
2) In UI:
   - “Points of Agreement” enthält Einträge (bei typischen Prompts, bei denen Modelle inhaltlich overlap haben)
3) Kein massives Over-Grouping:
   - Agreements sollen thematisch plausibel bleiben (Guardrails/Keywords verhindern “alles wird eins”)

---

## Testplan (End-to-End)
1) 2–3 typische Prompts laufen lassen, die erfahrungsgemäß ähnliche Empfehlungen erzeugen (z.B. “Go-to-market für …”).
2) Prüfen:
   - Agreements > 0
   - Dissent weiterhin sinnvoll (echte Outliers)
3) Logs prüfen: Top Cross-Model Similarity Pairs, Cluster-Zusammensetzung pro Topic.
