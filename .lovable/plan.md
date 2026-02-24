

## Fix: "Competitor analysis complete!" erscheint zu frueh

### Problem
Die aktuelle Implementierung zaehlt einfach **alle** Competitor-Profile (`is_own_website === false`) im gesamten Gespraech. Wenn bereits abgeschlossene Competitor-Profile aus frueheren Analysen existieren, wird die Bedingung sofort beim naechsten Realtime-Event erfuellt -- noch bevor die neuen Analysen ueberhaupt gestartet sind.

### Loesung
Statt nur die **Anzahl** zu tracken, werden die **konkreten URLs** gespeichert, die gerade analysiert werden. Der Realtime-Handler prueft dann nur diese spezifischen Profile auf Completion.

### Aenderungen

**Datei: `src/hooks/useChatAnalysis.ts`**

1. `expectedCompetitorCountRef` aendern von `useRef<number>(0)` zu `useRef<string[]>([])` -- speichert die URLs statt einer Zahl
2. `trackCompetitorAnalysis` aendern: nimmt jetzt `urls: string[]` statt `count: number`
3. Im Realtime-Handler (Zeilen 126-135): Statt alle Competitor-Profile zu zaehlen, nur die Profile filtern, deren URL in der tracked-Liste enthalten ist

**Datei: `src/pages/Chat.tsx`**

1. Den Aufruf von `trackCompetitorAnalysis(limitedUrls.length)` aendern zu `trackCompetitorAnalysis(limitedUrls)` -- uebergibt die URL-Liste statt der Anzahl

### Technischer Abschnitt

Aenderung im Realtime-Handler:
```text
// Vorher (fehlerhaft):
const competitorProfiles = deduped.filter(p => !p.is_own_website);
const doneCompetitors = competitorProfiles.filter(p => p.status === "completed" || p.status === "error").length;
if (doneCompetitors >= expectedComp) { ... }

// Nachher (korrekt):
const trackedUrls = expectedCompetitorUrlsRef.current;
if (trackedUrls.length > 0) {
    const trackedProfiles = deduped.filter(p => trackedUrls.includes(p.url));
    const doneCount = trackedProfiles.filter(p => p.status === "completed" || p.status === "error").length;
    if (doneCount >= trackedUrls.length) {
        expectedCompetitorUrlsRef.current = [];
        toast.success("Competitor analysis complete!");
    }
}
```

So wird der Toast nur ausgeloest, wenn genau die gerade gestarteten Competitor-URLs fertig sind -- nicht irgendwelche alten.

