
## Was die Logs eindeutig zeigen

### 1) Das System “bricht” nicht komplett, aber der Formatting-Schritt ist instabil
Dein Error:
- `Failed to parse formatted evaluation: SyntaxError: Expected double-quoted property name in JSON ...`

kommt aus `supabase/functions/meta-evaluation/index.ts` im **Formatting-Schritt (Step 3)**, wo der Gemini-Output als JSON geparst wird:

- Es wird `content` gelesen und dann `JSON.parse(...)` gemacht.
- Bei Premium ist der Output größer (mehr Felder + längere Texte), und der Model-Output ist häufiger **kein strikt valides JSON** (z.B. Keys ohne Anführungszeichen wie `competitorInsights: "..."`).

Wichtig: Dieser Parse-Error betrifft primär das **“Polishing/Formatting”** und die Premium-Sektionen; die eigentliche deterministische Consensus-Berechnung läuft davor (Step 2).

### 2) Es gibt zusätzlich eine echte Logik-Falle, die Agreements “leer wirken lassen” kann
Im Merge (Step 4) passiert aktuell:

```ts
consensusPoints: (formattedEvaluation?.formattedConsensus || computedConsensus).map(...)
```

Problem: Wenn `formattedConsensus` existiert, aber **leer ist** (`[]`), ist das in JS “truthy” und überschreibt `computedConsensus` vollständig. Ergebnis: **UI zeigt 0 Agreements**, obwohl die deterministische Berechnung ggf. welche hatte.

Das ist ein Konsistenz-Problem: Ein LLM darf niemals die “Existenz” der computed Points überschreiben.

### 3) Dass `consensusCount: 0` in manchen Runs vorkommt, kann trotzdem “korrekt” sein
Die deterministische Log-Zeile:
- `consensusCount: 0, dissentCount: 13`

bedeutet: Im aktuellen Prompt/Run gab es tatsächlich keine Cross-Model-Cluster (>=2 Modelle) über dem Similarity-Mechanismus. Das kann vorkommen – ist aber erst dann vertrauenswürdig, wenn (a) der Merge nicht computed überschreiben kann und (b) die Similarity-Logs sauber sind.

## Zielzustand (“korrekt funktioniert” bedeutet hier)
1) **Kein Parse-Error mehr** beim Premium-Formatting (oder sauberer Fallback ohne Error-Spam).
2) **Computed (deterministisch) ist Source of Truth**:
   - Agreements/Majority/Dissent, die rechnerisch gefunden wurden, erscheinen immer.
   - LLM darf nur Sprache “polishen”, nicht Inhalte/Existenz/Counts bestimmen.
3) Wenn Agreements wirklich 0 sind, ist das nachvollziehbar über Logs:
   - Top Cross-Model Similarity Pairs zeigen dann wirklich nur niedrige Werte.

---

## Änderungen, die ich implementieren werde (ohne UI-Anpassungen)

### A) JSON Parsing im Formatting Schritt robust & schema-gebunden machen
**Datei:** `supabase/functions/meta-evaluation/index.ts`

1) **Response Schema aktivieren**, analog zu `multi-ai-query`:
   - Aktuell ist nur `responseMimeType: "application/json"` gesetzt.
   - Ich werde zusätzlich `responseSchema` setzen, damit Gemini wirklich strikt JSON mit quoted keys liefert.

   Technisch:
   - `responseSchema` wird aus dem vorhandenen Schema abgeleitet:
     - `getFormattingTool(isPremium).function.parameters`

2) **Robustere JSON-Extraktion** vor `JSON.parse`:
   - Übernehme das bewährte Pattern aus `multi-ai-query`:
     - Codeblock-Extraction (` ```json ... ``` `)
     - Wenn nicht mit `{` startend: substring zwischen erster `{` und letzter `}`

3) Optionaler Sicherheitsgurt:
   - Wenn Parse fehlschlägt, logge ich zusätzlich eine gekürzte Vorschau des Outputs (z.B. erste 500 chars), damit du bei Bedarf sofort siehst, ob es JS-Object-Style oder Truncation war.

4) API Call Konsistenz:
   - Umstellen auf Header-Auth (`x-goog-api-key`) statt Query-Param `?key=...` (wie in `multi-ai-query`), um das Verhalten zu vereinheitlichen.

### B) Merge-Logik: Computed Listen sind immer die Iterationsbasis (entscheidend für Konsistenz)
**Datei:** `supabase/functions/meta-evaluation/index.ts`

Ich ändere Step 4 so, dass:
- `finalEvaluation.consensusPoints` immer aus `computedConsensus.map(...)` entsteht
- `formattedEvaluation?.formattedConsensus` darf nur **Beschreibung/ActionItems** “polishen”, niemals:
  - Items entfernen
  - Reihenfolge/Existenz bestimmen

Konkretes Merge-Verhalten:
- Baseline: `computedConsensus[i]`
- Falls `formattedConsensus[i]` vorhanden: nutze `description`, optional `actionItems`
- Fallback wenn formatted fehlt: computed 그대로

Das gleiche Prinzip gilt für:
- `majorityPoints` (computed als Basis)
- `dissentPoints` (computed als Basis; optional nur Topic/Position-Text polishen, ohne Modelle/Anzahl zu verändern)

Damit ist garantiert: “Agreements sind konsistent”, weil sie deterministisch sind und durch LLM nicht verschwinden können.

### C) Premium-Formatting darf niemals leere Arrays liefern, die computed “überschreiben”
Auch wenn Schema aktiv ist, kann das Modell theoretisch leere Arrays ausgeben. Durch (B) ist das dann egal; computed bleibt sichtbar.

### D) (Optional aber sinnvoll) Mehr Debug-Signal im Response statt nur Logs
In der Response gibt es bereits `_debug` mit Counts.
Ich erweitere `_debug` optional um:
- `formattingParsed: boolean`
- `formattingParseError: string | null`
- `formattedConsensusLength` etc.

So kannst du im Frontend/Network sofort sehen: “Computed hatte X, Formatting war ok/kaputt”.

---

## Validierungs-/Testplan (End-to-End)

### 1) Premium-Run reproduzieren
- Prompt wie bei deinem Error erneut laufen lassen
- Erwartung:
  - Kein `Failed to parse formatted evaluation` mehr (oder mindestens: “parse failed -> fallback” ohne JSON-Syntaxfehler-Spam)
  - UI zeigt Agreements exakt entsprechend computed (wenn computed>0)

### 2) Vergleich: Free vs Premium mit identischem Prompt
- Erwartung:
  - Agreements/Dissents sollten im Kern gleich bleiben (weil deterministisch)
  - Premium hat nur bessere Sprache + Premium Insights, aber keine “anderen” Agreement-Counts aufgrund LLM

### 3) Falls Agreements weiterhin 0 sind:
- Die bereits eingebauten Logs “Top 10 cross-model similarity pairs” aus Step 2 anschauen:
  - Wenn Top-Scores < ~0.28: dann ist es ein “echtes” Nicht-Agreement (Modelle sind wirklich verschieden)
  - Wenn Top-Scores >= 0.35 existieren, aber dennoch 0 Agreements: dann wäre es ein Clustering-Bug (würde ich dann als nächsten Schritt fixen)

---

## Rollout / was du danach beachten musst
- Nach Umsetzung muss die aktualisierte `meta-evaluation` Backend-Funktion neu deployed werden (damit der Fix im echten Premium-Test greift).
- Danach bitte 1–2 Premium-Analysen durchlaufen lassen und mir:
  - die neuen Logs rund um “formatting parsed” + “Top 10 cross-model similarity pairs”
  - sowie das `_debug` Feld aus der Response (Network-Response)
  schicken, falls noch etwas auffällig ist.

---

## Erwartetes Ergebnis
- Premium-Analysen erzeugen keine JSON-Parse-Errors mehr.
- Agreements verschwinden nicht mehr “zufällig” (weil computed nicht mehr von formatted überschrieben werden kann).
- Wenn Agreements 0 sind, ist es nachvollziehbar und technisch korrekt begründet (Similarity-Distribution), nicht wegen Parsing/Merge.
