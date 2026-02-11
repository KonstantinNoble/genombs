

# Drei Verbesserungen: Ladebalken, Analyse-Summary und URL-Persistenz

## Problem 1: Kein Ladebalken im Chat waehrend der Analyse

**Aktuell:** Wenn die Analyse laeuft, sieht man im Chat nur den Text "Analyzing..." im Header (Zeile 302 in Chat.tsx). Im Dashboard-Panel gibt es Spinner-Karten, aber im Chat selbst fehlt jede visuelle Rueckmeldung.

**Loesung:** Eine animierte Fortschrittsanzeige direkt im Chat-Bereich einblenden, die den aktuellen Status der Analyse zeigt (Crawling, Analyzing, Done). Die Komponente nutzt die bereits vorhandenen `profiles`-Daten mit ihren Status-Werten (`crawling`, `analyzing`, `completed`, `error`) und zeigt fuer jede URL den Fortschritt an.

### Neue Datei: `src/components/chat/AnalysisProgress.tsx`

Eine Komponente, die waehrend `isAnalyzing` im Chat-Bereich zwischen den Nachrichten und dem Input angezeigt wird:
- Zeigt jede URL mit ihrem aktuellen Status
- Animierter Fortschrittsbalken (Progress-Komponente aus UI-Library)
- Status-Mapping: `crawling` = 33%, `analyzing` = 66%, `completed` = 100%, `error` = rot
- Verschwindet automatisch wenn alle Analysen fertig sind

### Aenderung: `src/pages/Chat.tsx`

Im `chatPanel` (Zeile 312-324) wird die neue `AnalysisProgress`-Komponente unterhalb der Nachrichten und oberhalb des Inputs eingeblendet, wenn Analysen laufen oder noch nicht abgeschlossen sind.

---

## Problem 2: Keine Zusammenfassung nach der Analyse

**Aktuell:** Wenn die Analyse abgeschlossen ist, passiert im Chat nichts. Der User sieht die Ergebnisse nur im Dashboard-Panel, bekommt aber keine Chat-Nachricht.

**Loesung:** Nach Abschluss aller Analysen automatisch eine KI-generierte Zusammenfassung als Assistant-Nachricht in den Chat schreiben. Der Chat-Endpunkt wird mit den Analyse-Ergebnissen aufgerufen, um eine natuerlichsprachige Zusammenfassung zu streamen.

### Aenderung: `src/pages/Chat.tsx` - `handleScan` Funktion

Nach dem `Promise.all` (Zeile 220-226), wenn alle Analysen fertig sind:

1. Warte kurz (1-2 Sekunden), damit die Realtime-Updates die Profile aktualisieren
2. Lade die fertigen Profile aus der DB
3. Baue einen Zusammenfassungs-Prompt aus den Analyse-Ergebnissen
4. Rufe `streamChat()` auf mit diesem Prompt (im Hintergrund, nicht als User-Nachricht sichtbar)
5. Zeige die gestreamte Zusammenfassung als Assistant-Nachricht im Chat

Der Zusammenfassungs-Prompt enthaelt:
- Alle analysierten URLs mit ihren Scores
- Staerken und Schwaechen
- Anweisung: "Fasse die Analyse-Ergebnisse zusammen und gib konkrete Handlungsempfehlungen"

---

## Problem 3: URLs werden nicht im Formular gespeichert

**Aktuell:** In `ChatInput.tsx` Zeile 75-78 werden nach dem Start der Analyse alle URL-Felder geleert:
```
setOwnUrl("");
setComp1("");
setComp2("");
setComp3("");
```

Das bedeutet: Wenn der User spaeter die Analyse aktualisieren will (z.B. mit einem anderen Modell), muss er alle URLs erneut eingeben.

**Loesung:** Die URLs werden NICHT mehr geleert nach der Analyse. Stattdessen bleiben sie im Formular bestehen, sodass der User:
- Die Analyse mit einem anderen Modell wiederholen kann
- Einzelne URLs aendern kann
- Nur den "Start Analysis"-Button druecken muss

Zusaetzlich werden die URLs pro Conversation in der DB persistiert, damit sie auch nach einem Page-Reload noch da sind.

### Aenderung 1: `src/components/chat/ChatInput.tsx`

- Zeilen 75-78 entfernen (URLs nicht mehr leeren)
- Neue Props hinzufuegen: `initialOwnUrl`, `initialCompetitorUrls` um URLs von aussen zu setzen
- `useEffect` der die URL-Felder setzt wenn sich die Props aendern

### Aenderung 2: `src/pages/Chat.tsx`

- Die bereits analysierten URLs aus den `profiles` extrahieren und als `initialOwnUrl`/`initialCompetitorUrls` an `ChatInput` uebergeben
- Eigene URL = Profile mit `is_own_website === true`
- Competitor URLs = Profile mit `is_own_website === false`

---

## Betroffene Dateien

| Datei | Aenderung |
|---|---|
| `src/components/chat/AnalysisProgress.tsx` | **NEU** - Fortschrittsanzeige mit animierten Balken pro URL |
| `src/components/chat/ChatInput.tsx` | URLs nicht leeren + neue Props fuer initiale URLs |
| `src/pages/Chat.tsx` | AnalysisProgress einbinden, Summary nach Analyse streamen, URLs aus Profiles an ChatInput uebergeben |

## Technische Details

### AnalysisProgress-Komponente

```text
Props:
  profiles: WebsiteProfile[]  (alle Profile der Conversation)

Rendering:
  - Filtert auf nicht-completed Profile
  - Zeigt pro URL: Name, Status-Text, Progress-Balken
  - Status -> Prozent: pending=10, crawling=33, analyzing=66, completed=100
  - Gruen bei completed, Rot bei error, Blau bei crawling/analyzing
```

### Summary-Logik in handleScan

```text
1. await Promise.all(analyzeWebsite(...))
2. await new Promise(resolve => setTimeout(resolve, 2000))  // Warte auf Realtime
3. const freshProfiles = await loadProfiles(activeId)
4. const completed = freshProfiles.filter(p => p.status === "completed")
5. if (completed.length > 0):
   - Baue summaryPrompt aus completed profiles
   - Streame Assistant-Nachricht via streamChat()
   - Speichere finale Nachricht in DB
```

### URL-Persistenz

Die URLs werden aus den vorhandenen `profiles` der aktiven Conversation abgeleitet - keine DB-Schema-Aenderung noetig:
```text
const ownProfile = profiles.find(p => p.is_own_website)
const competitorProfiles = profiles.filter(p => !p.is_own_website)

initialOwnUrl = ownProfile?.url || ""
initialCompetitorUrls = competitorProfiles.map(p => p.url)
```
