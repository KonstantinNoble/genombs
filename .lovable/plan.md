

## "Analysis complete" Meldung fuer Competitor-Analyse

### Problem
Wenn User ueber die Competitor-Vorschlagskarten eine Analyse starten, erscheint nur "Analyzing X competitors..." -- aber keine Bestaetigung, wenn die Analyse tatsaechlich fertig ist.

### Loesung
Eine Completion-Erkennung fuer Competitor-Analysen einbauen, die einen Toast "Competitor analysis complete" anzeigt, sobald alle gestarteten Competitor-Profile den Status `completed` erreichen.

### Aenderungen

**Datei: `src/hooks/useChatAnalysis.ts`**

1. Neuen Ref `expectedCompetitorCountRef` hinzufuegen (analog zu `expectedProfileCountRef`)
2. Neue Funktion `trackCompetitorAnalysis(count: number)` exportieren, die den Ref setzt
3. Im Realtime-Handler (Zeilen 107-123): Zusaetzliche Pruefung fuer Competitor-Profile einfuegen -- wenn `expectedCompetitorCountRef > 0` und genug non-own profiles fertig sind, einen `toast.success("Competitor analysis complete!")` anzeigen und den Ref zuruecksetzen

**Datei: `src/pages/Chat.tsx`**

1. `trackCompetitorAnalysis` aus `useChatAnalysis` importieren
2. In `handleAnalyzeSelectedCompetitors` (nach dem erfolgreichen `Promise.all`): `trackCompetitorAnalysis(limitedUrls.length)` aufrufen, damit der Realtime-Handler weiss, wie viele Competitor-Profile er erwarten soll

### Visuelles Ergebnis

1. User klickt "Analyze 2 competitors" -> Toast: "Analyzing 2 competitors..."
2. Profile werden im Hintergrund erstellt und analysiert
3. Sobald beide fertig -> Toast: "Competitor analysis complete!"

### Technischer Abschnitt

- Zwei Dateien betroffen: `useChatAnalysis.ts` und `Chat.tsx`
- Der Mechanismus nutzt die bestehende Realtime-Subscription, die bereits Profile-Status-Aenderungen ueberwacht
- Es wird ein separater Ref verwendet (`expectedCompetitorCountRef`), um Konflikte mit dem bestehenden `expectedProfileCountRef` (fuer den Haupt-Scan) zu vermeiden
- Die Completion-Erkennung zaehlt Profile mit `is_own_website === false` und Status `completed` oder `error`
- Kein Datenbank-Aenderung noetig

