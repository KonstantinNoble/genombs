

## Fix: `TypeError: Url scheme 'about' not supported`

### Ursache

In der `process-analysis-queue` Edge Function befinden sich auf **Zeile 578 und 588** zwei unsinnige Aufrufe:

```typescript
await (await fetch("about:blank")).text(); // Consume response
```

`fetch("about:blank")` ist in Deno nicht erlaubt -- Deno unterstuetzt nur `http:` und `https:` URL-Schemes. Diese Zeilen haben keinen funktionalen Zweck und verursachen den Fehler.

### Loesung

Beide Zeilen (578 und 588) werden entfernt. Der restliche Handler-Code bleibt unveraendert:

```typescript
serve(async (req) => {
  if (req.method === "POST") {
    try {
      await processQueue();
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Queue processor error:", err);
      return new Response(JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  return new Response("Method not allowed", { status: 405 });
});
```

### Aenderungen

| Datei | Aenderung |
|-------|-----------|
| `supabase/functions/process-analysis-queue/index.ts` | Zeilen 578 und 588 entfernen (`fetch("about:blank")`) |

### Hinweis

Der zweite Fehler in den Logs (`FIRECRAWL_API_KEY not configured`) kommt von der **Lovable Cloud** Instanz (Projekt `rrrhsbmyndgublwsirfx`), nicht von deinem externen Supabase-Projekt. Dieser Fehler ist erwartet, da die Secrets nur auf dem externen Projekt konfiguriert sind. Falls du die Queue ausschliesslich auf dem externen Projekt nutzt, ist das kein Problem.

