
# Fix: Echtzeit-Credit-Aktualisierung

## Problem

Credits werden erst nach Seiten-Reload korrekt angezeigt, weil:

1. **Analyse-Credits werden asynchron abgezogen**: Die `process-analysis-queue` Edge Function laeuft per Cron (alle 30s). Wenn der User eine Analyse startet, wird `refreshCredits()` sofort aufgerufen -- aber die Credits werden erst spaeter abgezogen. Das Realtime-Event fuer `user_credits` kommt nicht zuverlaessig an.

2. **Kein refreshCredits bei Profil-Completion**: Die Realtime-Subscription fuer `website_profiles` in `useChatAnalysis.ts` laedt zwar Profile neu, ruft aber NICHT `refreshCredits()` auf, obwohl genau zu diesem Zeitpunkt Credits abgezogen wurden.

3. **Kein Fallback-Polling**: Wenn die Realtime-Verbindung fuer `user_credits` fehlschlaegt (z.B. Netzwerkprobleme), gibt es keinen Fallback.

## Loesung

### 1. `src/hooks/useChatAnalysis.ts` -- refreshCredits bei Profil-Completion

In der Realtime-Subscription fuer `website_profiles` (Zeile 89-117) wird `refreshCredits()` aufgerufen, sobald ein Profil den Status "completed" oder "error" erhaelt. Das ist genau der Zeitpunkt, an dem `process-analysis-queue` die Credits abgezogen hat.

**Aenderungen:**
- `refreshCredits` als Parameter zum Hook hinzufuegen (Interface + Destrukturierung)
- Im Realtime-Callback (Zeile 89-116): nach dem Laden der Profile `refreshCredits()` aufrufen, wenn sich der Status eines Profils auf "completed" oder "error" geaendert hat

```typescript
// Im Realtime-Callback nach loadProfiles:
refreshCredits(); // Credits nach jeder Profil-Aenderung aktualisieren
```

### 2. `src/contexts/AuthContext.tsx` -- Polling-Fallback hinzufuegen

Ein Intervall-basierter Fallback, der alle 30 Sekunden die Credits abfragt, solange der User eingeloggt ist. Das faengt Faelle ab, in denen Realtime nicht zuverlaessig funktioniert (Netzwerkprobleme, externe Supabase-Instanz).

**Neuer useEffect:**

```typescript
// Polling fallback for credit refresh (every 30s)
useEffect(() => {
  if (!user) return;
  const interval = setInterval(() => {
    refreshCredits();
  }, 30000);
  return () => clearInterval(interval);
}, [user, refreshCredits]);
```

### 3. `src/pages/Chat.tsx` -- refreshCredits an useChatAnalysis weitergeben

Der `refreshCredits`-Parameter muss an den `useChatAnalysis`-Hook durchgereicht werden, damit dieser ihn im Realtime-Callback verwenden kann.

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `src/hooks/useChatAnalysis.ts` | `refreshCredits` als Parameter + Aufruf im Realtime-Callback bei Profil-Completion |
| `src/contexts/AuthContext.tsx` | 30-Sekunden Polling-Fallback fuer Credit-Refresh |
| `src/pages/Chat.tsx` | `refreshCredits` an `useChatAnalysis` Hook uebergeben |

## Warum diese Loesung?

- **Realtime + Polling = Zuverlaessigkeit**: Realtime gibt sofortige Updates wenn es funktioniert, Polling faengt Ausfaelle ab
- **Profil-Completion-Trigger**: Genau zum richtigen Zeitpunkt (wenn Credits tatsaechlich abgezogen wurden) wird `refreshCredits()` aufgerufen
- **Minimale Aenderungen**: Nur 3 Dateien, keine neuen Abhaengigkeiten
- **30s Intervall**: Genuegend fuer zeitnahe Updates, ohne die Datenbank zu ueberlasten
