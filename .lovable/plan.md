

## Fix: Credit-Anzeige nach Chat-Nachrichten sofort aktualisieren

### Problem
Beim Senden einer Chat-Nachricht wird `refreshCredits()` nur im Fehlerfall (`catch`) aufgerufen, nicht aber nach einer erfolgreichen Nachricht. Bei der Website-Analyse hingegen wird `refreshCredits()` im `finally`-Block aufgerufen, weshalb die Anzeige dort korrekt funktioniert.

### Loesung
`refreshCredits()` in den `finally`-Block der `handleSend`-Funktion verschieben, sodass die Credit-Anzeige nach jeder Chat-Nachricht aktualisiert wird -- egal ob erfolgreich oder fehlgeschlagen.

### Technische Details

**Datei:** `src/pages/Chat.tsx`

Aenderung in der `handleSend`-Funktion (ca. Zeile 275-289):

Vorher:
```
} catch (e) {
  ...
  refreshCredits();    // <-- nur bei Fehler
} finally {
  setIsStreaming(false);
}
```

Nachher:
```
} catch (e) {
  ...
  // refreshCredits entfernt
} finally {
  setIsStreaming(false);
  refreshCredits();    // <-- immer ausfuehren
}
```

### Zusammenfassung
| Was | Wo |
|-----|----|
| `refreshCredits()` von `catch` nach `finally` verschieben | `src/pages/Chat.tsx`, `handleSend` |

Eine einzelne Zeile wird verschoben. Keine weiteren Dateien betroffen.

