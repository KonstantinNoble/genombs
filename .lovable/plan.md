

## Credits bei Fehlern zurueckerstatten

### Problem
Wenn eine Analyse oder Chat-Anfrage fehlschlaegt (z.B. Website-Timeout, AI-Service-Fehler), werden die Credits trotzdem abgezogen, obwohl kein Ergebnis geliefert wurde.

### Loesung
Credits werden weiterhin vorher abgezogen (um Missbrauch durch parallele Anfragen zu verhindern), aber bei einem Fehler automatisch zurueckerstattet.

### Aenderungen

#### 1. `supabase/functions/analyze-website/index.ts`

Die Credits werden aktuell in Zeile 505 abgezogen, bevor der Job in die Queue kommt. Wenn danach ein Fehler passiert (Queue-Insert fehlgeschlagen, oder spaeter im Worker), gibt es keine Erstattung.

**Loesung:** Eine Refund-Funktion einbauen, die bei Queue-Insert-Fehlern sofort die Credits zurueckgibt. Fuer Fehler waehrend der Verarbeitung (im Worker) wird der Refund im Worker selbst eingebaut.

#### 2. `supabase/functions/process-analysis-queue/index.ts`

Der Worker verarbeitet Jobs und markiert Fehler (Firecrawl-Timeout, AI-Fehler). Aktuell werden dabei keine Credits zurueckerstattet.

**Loesung:** Im `catch`-Block (Zeile 792) und bei Firecrawl-Fehlern (Zeile 634) werden die Credits des Users zurueckerstattet:
- Credit-Kosten des Jobs berechnen (basierend auf `job.model`)
- `credits_used` um den Betrag reduzieren
- Log-Nachricht: "Credits refunded for failed job"

Gleiches gilt fuer den Timeout-Cleanup (Zeile 527-532): Wenn ein Job wegen Timeout abgebrochen wird, werden die Credits ebenfalls zurueckerstattet.

#### 3. `supabase/functions/chat/index.ts`

Credits werden in Zeile 441 abgezogen. Wenn der AI-Provider einen Fehler zurueckgibt (Zeile 508), sind die Credits verloren.

**Loesung:** Im Fehlerfall (Provider antwortet mit `!ok`) die Credits zurueckerstatten:
- Nach der Credit-Abzugs-Stelle den `credits`-Record merken (ID und aktuellen Stand)
- Bei AI-Provider-Fehler: `credits_used` um den Chat-Kosten-Betrag reduzieren
- Refund-Log schreiben

### Technische Details

**Refund-Logik (wird in alle 3 Dateien eingebaut):**

```
async function refundCredits(supabaseAdmin, userId, cost) {
  const { data } = await supabaseAdmin
    .from("user_credits")
    .select("id, credits_used")
    .eq("user_id", userId)
    .single();

  if (data) {
    const newUsed = Math.max(0, (data.credits_used ?? 0) - cost);
    await supabaseAdmin
      .from("user_credits")
      .update({ credits_used: newUsed })
      .eq("id", data.id);
  }
}
```

**Geaenderte Dateien:**
- `supabase/functions/analyze-website/index.ts` -- Refund bei Queue-Insert-Fehler
- `supabase/functions/process-analysis-queue/index.ts` -- Refund bei Crawl-Fehler, AI-Fehler, und Timeout-Cleanup
- `supabase/functions/chat/index.ts` -- Refund bei AI-Provider-Fehler

**Keine Datenbank-Aenderungen noetig.** Die bestehende `credits_used`-Spalte wird einfach wieder reduziert.

