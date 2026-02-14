

## Fix: KI-Zusammenfassung nach Analyse + Geschwindigkeitsoptimierung

### Problem 1: KI schreibt keine Zusammenfassung

**Ursache**: Nach dem Starten der Analyse wartet der Code nur 3 Sekunden (`setTimeout(..., 3000)`) bevor er prüft, ob Profile fertig sind. Die Analyse läuft aber über eine Warteschlange, die alle 30-60 Sekunden verarbeitet wird. Nach 3 Sekunden sind die Profile noch im Status "pending" -- die Zusammenfassung wird nie ausgelöst.

**Lösung**: Statt eines festen Timeouts wird die bereits vorhandene Realtime-Subscription genutzt. Wenn alle erwarteten Profile den Status "completed" (oder "error") erreicht haben, wird automatisch die KI-Zusammenfassung generiert.

### Problem 2: Analyse dauert zu lange

**Ursache**: Die Warteschlange wird nur durch pg_cron alle 30-60 Sekunden abgearbeitet. Selbst wenn keine anderen Jobs anstehen, muss ein User bis zu 60 Sekunden warten, bevor seine Analyse überhaupt startet.

**Lösung**: Nach dem Einfügen der Jobs in die Queue wird der Queue-Processor sofort per HTTP-Aufruf gestartet ("Kick"), zusätzlich zum normalen pg_cron-Intervall. Die Analyse startet dadurch in unter 2 Sekunden statt 30-60 Sekunden.

### Technische Umsetzung

**Datei 1: `src/pages/Chat.tsx`**

- Den `setTimeout(..., 3000)` Block (Zeilen 386-436) komplett entfernen
- Einen neuen State `expectedProfileCount` einführen, der die Anzahl der erwarteten Analyse-URLs speichert
- In `handleScan`: `expectedProfileCount` auf die Anzahl aller URLs setzen
- In der bestehenden Realtime-Subscription (Zeilen 132-164): Prüfen, ob alle erwarteten Profile fertig sind (completed + error >= expectedProfileCount). Wenn ja, automatisch die KI-Zusammenfassung triggern und `expectedProfileCount` zurücksetzen

**Datei 2: `supabase/functions/analyze-website/index.ts`**

- Am Ende der Funktion (nach dem Queue-Insert) einen HTTP POST an `process-analysis-queue` senden, um den Worker sofort zu starten
- Das passiert im Hintergrund (fire-and-forget), damit die Response nicht verzögert wird

### Zusammenfassung der Änderungen

| Datei | Änderung |
|-------|----------|
| `src/pages/Chat.tsx` | setTimeout-Summary durch Realtime-basierte Erkennung ersetzen |
| `supabase/functions/analyze-website/index.ts` | Queue-Worker sofort nach Job-Insert triggern |

