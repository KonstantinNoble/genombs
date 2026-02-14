

## Fix: PageSpeed Debug-Logging hinzufuegen

### Problem

Der Code ueberspringt PageSpeed still, wenn das Secret `PAGESPEED_GOOGLE` nicht gefunden wird. Es gibt kein Logging, das zeigt ob der Key geladen wurde -- daher keine Diagnose moeglich.

### Aenderung

**Datei:** `supabase/functions/process-analysis-queue/index.ts`

An 3 Stellen wird Logging hinzugefuegt:

1. **Zeile 569-577** -- Nach dem Lesen des Secrets:
```
const pagespeedApiKey = Deno.env.get("PAGESPEED_GOOGLE");
if (pagespeedApiKey) {
  console.log("PAGESPEED_GOOGLE key found, fetching PageSpeed data...");
  pagespeedData = await fetchPageSpeedData(job.url, pagespeedApiKey);
  if (pagespeedData) {
    console.log("PageSpeed data received:", JSON.stringify(pagespeedData));
    // ... append to enrichedContent (wie bisher)
  } else {
    console.warn("PageSpeed returned null for URL:", job.url);
  }
} else {
  console.warn("PAGESPEED_GOOGLE secret NOT FOUND -- skipping PageSpeed");
}
```

2. **Zeile 376-379** -- In `fetchPageSpeedData`, bei API-Fehler den Response-Body loggen:
```
if (!resp.ok) {
  const errorBody = await resp.text();
  console.warn(`PageSpeed API error ${resp.status} for ${url}:`, errorBody);
  return null;
}
```

### Was du nach dem Deploy tun musst

1. Deploye die Edge Function auf deine externe Instanz
2. Fuehre eine Analyse aus
3. Pruefe die Edge Function Logs im Supabase Dashboard (Logs -> Edge Functions -> process-analysis-queue)
4. Dort siehst du dann entweder:
   - "PAGESPEED_GOOGLE secret NOT FOUND" -> Secret-Name pruefen
   - "PageSpeed API error 403" -> API-Key ungueltig oder API nicht aktiviert
   - "PageSpeed data received" -> Alles funktioniert

### Checkliste fuer deine externe Instanz

- [ ] Secret heisst exakt `PAGESPEED_GOOGLE` (Settings -> Edge Functions -> Secrets)
- [ ] Google PageSpeed API ist in der Google Cloud Console aktiviert
- [ ] API-Key hat keine Domain-Einschraenkung die den Server-Aufruf blockiert
- [ ] `pagespeed_data` Spalte existiert in `website_profiles`

