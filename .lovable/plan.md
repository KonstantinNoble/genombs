

## Analyse-Geschwindigkeit optimieren

### Was wird geaendert

Eine einzige Datei wird angepasst: `supabase/functions/process-analysis-queue/index.ts`. Es gibt keine Aenderungen am Frontend oder an der Datenbank.

### Optimierungen

**1. Firecrawl + PageSpeed gleichzeitig starten**

Bisher wird erst gecrawlt, dann PageSpeed abgerufen. Beide sind unabhaengig und koennen parallel laufen. Das spart 2-5 Sekunden.

**2. Screenshot-Upload im Hintergrund**

Der Screenshot-Upload blockiert aktuell die Analyse. Da er nicht kritisch ist, wird er als "fire-and-forget" ausgefuehrt -- mit Fehlerprotokollierung, aber ohne die Analyse aufzuhalten. Spart ca. 0.5-1 Sekunde.

**3. Firecrawl Wartezeit reduzieren**

`waitFor` wird von 3000ms auf 2000ms gesenkt. Die meisten Websites rendern innerhalb von 2 Sekunden. Spart 1 Sekunde.

**4. Mehrere Queue-Jobs parallel**

Die `for`-Schleife (nacheinander) wird durch `Promise.allSettled` ersetzt, sodass bis zu 3 Jobs gleichzeitig verarbeitet werden.

### Sicherheit

- Jeder Job hat weiterhin seine eigene Fehlerbehandlung (try/catch)
- Wenn ein Job fehlschlaegt, beeinflusst das die anderen nicht
- Screenshot-Fehler werden geloggt, blockieren aber nichts
- Keine neuen Abhaengigkeiten, keine DB-Aenderungen

### Geschaetzte Verbesserung

Ca. 3-7 Sekunden schneller pro Analyse (von ~15s auf ~9s).

### Technische Details

| Aenderung | Vorher | Nachher |
|---|---|---|
| Firecrawl + PageSpeed | Sequenziell | `Promise.all` |
| Screenshot-Upload | `await` (blockierend) | Fire-and-forget mit `.then()` |
| waitFor | 3000ms | 2000ms |
| Job-Verarbeitung | `for`-Schleife | `Promise.allSettled` |

Datei: `supabase/functions/process-analysis-queue/index.ts`

