

# Fix: Firecrawl SCRAPE_TIMEOUT fuer langsame Websites

## Problem
Der Fehler `SCRAPE_TIMEOUT` kommt direkt von der Firecrawl-API. Der Parameter `timeout: 45000` wird an Firecrawl gesendet, aber Firecrawl schafft es nicht, ithy.com innerhalb von 45 Sekunden zu scrapen. Unser AbortController (60s) ist irrelevant, da Firecrawl vorher abbricht.

## Loesung
Die Timeout-Werte weiter erhoehen und einen Retry-Mechanismus mit Fallback hinzufuegen:

### 1. Firecrawl-Timeout erhoehen
- `timeout`: 45000 auf **90000** (90 Sekunden)
- `waitFor`: 5000 auf **8000** (mehr JS-Rendering-Zeit)
- AbortController: 60000 auf **120000** (muss groesser als Firecrawl-Timeout sein)

### 2. Retry bei SCRAPE_TIMEOUT (optional aber empfohlen)
Bei einem `SCRAPE_TIMEOUT` automatisch einen zweiten Versuch mit `onlyMainContent: true` starten. Weniger Daten = schneller = hoehere Erfolgschance. Der Screenshot wird dann beim Retry weggelassen.

## Technische Details

**Datei:** `supabase/functions/process-analysis-queue/index.ts`

### Aenderung 1: Timeout-Werte (Zeilen 638, 650-651)
```typescript
// Vorher
const crawlAbortTimeout = setTimeout(() => crawlController.abort(), 60000);
// ...
waitFor: 5000,
timeout: 45000,

// Nachher
const crawlAbortTimeout = setTimeout(() => crawlController.abort(), 120000);
// ...
waitFor: 8000,
timeout: 90000,
```

### Aenderung 2: Retry-Logik nach dem Firecrawl-Aufruf
Nach dem bestehenden Firecrawl-Fehlerhandling wird geprueft, ob der Fehler `SCRAPE_TIMEOUT` ist. Falls ja, wird ein zweiter Versuch mit reduzierten Formaten (`markdown` und `links` nur) und `onlyMainContent: true` gestartet. Das erhoet die Chance, dass auch JS-lastige Websites erfolgreich gescrapt werden.

### Wichtig
Da die Edge Functions auf der externen Supabase-Instanz laufen, muss nach der Code-Aenderung erneut deployed werden:
```
supabase functions deploy process-analysis-queue --project-ref xnkspttfhcnqzhmazggn
```

