

# Firecrawl Scrape Timeout beheben

## Problem

Die Firecrawl Scrape-Anfrage hat keinen expliziten `timeout`-Parameter. Bei Websites mit viel JavaScript oder langsamer Antwortzeit laeuft der Scrape in ein Timeout, und der Fehler wird direkt an den User weitergegeben. Der `waitFor: 2000` (2 Sekunden fuer JS-Rendering) ist zwar gesetzt, aber es fehlt ein hoeherer Gesamttimeout fuer die HTTP-Anfrage selbst.

## Loesung

### 1. `supabase/functions/process-analysis-queue/index.ts`

**a) Firecrawl-Anfrage mit `timeout`-Parameter erweitern (Zeile 514-519):**

Firecrawl unterstuetzt einen `timeout`-Parameter in Millisekunden. Den Wert auf 30000 (30 Sekunden) setzen, um langsamen Websites mehr Zeit zu geben:

```typescript
body: JSON.stringify({
  url: job.url,
  formats: ["markdown", "rawHtml", "links", "screenshot"],
  onlyMainContent: false,
  waitFor: 2000,
  timeout: 30000,
}),
```

**b) Fetch-Anfrage mit AbortController absichern (Zeile 508-520):**

Falls Firecrawl selbst nicht antwortet, wird die fetch-Anfrage ueber einen AbortController nach 45 Sekunden abgebrochen. So bleibt der Worker nicht endlos haengen:

```typescript
const crawlController = new AbortController();
const crawlTimeout = setTimeout(() => crawlController.abort(), 45000);

const crawlPromise = fetch("https://api.firecrawl.dev/v1/scrape", {
  method: "POST",
  headers: { ... },
  body: JSON.stringify({ ... }),
  signal: crawlController.signal,
}).finally(() => clearTimeout(crawlTimeout));
```

**c) Bessere Fehlermeldung bei Timeout (Zeile 552-571):**

Wenn der Fehler ein Timeout ist, wird eine benutzerfreundliche Meldung gespeichert statt des rohen API-Fehlers:

```typescript
if (!crawlResp.ok) {
  const errorMsg = crawlData.error || "Crawl failed";
  const userMessage = errorMsg.toLowerCase().includes("timeout")
    ? "The website took too long to load. Please try again or check if the site is accessible."
    : errorMsg;
  // ... update mit userMessage statt errorMsg
}
```

Zusaetzlich einen Catch-Block fuer AbortError hinzufuegen, der greift wenn der AbortController ausloest.

## Betroffene Dateien

| Datei | Aenderung |
|-------|-----------|
| `supabase/functions/process-analysis-queue/index.ts` | Timeout-Parameter, AbortController, bessere Fehlermeldung |

