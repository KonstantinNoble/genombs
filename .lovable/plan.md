

## Credit-Refund: 3 logische Fehler beheben

### Gefundene Probleme

Die Refund-Logik ist in `process-analysis-queue` korrekt implementiert (Timeout, Crawl-Fehler, Job-Fehler). Aber in den anderen zwei Dateien fehlen Refunds an wichtigen Stellen:

#### Problem 1: `analyze-website` -- Profile-Insert-Fehler
Credits werden abgezogen (Zeile 533), aber wenn danach der `website_profiles`-Insert fehlschlaegt (Zeile 566), werden die Credits nicht zurueckerstattet. Nur der Queue-Insert-Fehler (Zeile 593) hat einen Refund.

**Fix:** Refund in den Profile-Insert-Fehlerblock einfuegen (Zeile 566-572).

#### Problem 2: `analyze-website` -- Aeusserer Catch-Block
Der aeussere `catch`-Block (Zeile 635-641) faengt unerwartete Fehler ab, die nach dem Credit-Abzug passieren koennten. Kein Refund dort.

**Fix:** Refund im aeusseren Catch-Block. Da wir nicht sicher wissen ob Credits bereits abgezogen wurden, merken wir uns nach dem Abzug eine Flag-Variable (`creditsDeducted = true`) und pruefen diese im Catch.

#### Problem 3: `chat` -- Aeusserer Catch-Block
Credits werden abgezogen (Zeile 469), danach kann ein Fehler beim Profile-Fetch oder der Stream-Transformation auftreten. Der aeussere Catch-Block (Zeile 569-575) erstattet keine Credits.

**Fix:** Gleiche Loesung wie bei analyze-website: Flag-Variable nach Credit-Abzug setzen, im Catch pruefen und Refund ausfuehren.

### Technische Details

**`supabase/functions/analyze-website/index.ts`:**
- Nach `checkAndDeductAnalysisCredits` (Zeile 533): Variable `let creditsDeducted = false;` davor, `creditsDeducted = true;` danach setzen
- Zeile 566-572 (Profile-Insert-Fehler): `await refundCredits(...)` hinzufuegen
- Zeile 635-641 (aeusserer Catch): `if (creditsDeducted) await refundCredits(...)` hinzufuegen

**`supabase/functions/chat/index.ts`:**
- Nach `checkAndDeductCredits` (Zeile 469): Variable `let creditsDeducted = false;` davor, `creditsDeducted = true;` danach setzen
- Zeile 569-575 (aeusserer Catch): `if (creditsDeducted) await refundCredits(...)` hinzufuegen

**`supabase/functions/process-analysis-queue/index.ts`:**
- Keine Aenderungen noetig -- die Implementierung ist korrekt.

### Geaenderte Dateien
- `supabase/functions/analyze-website/index.ts` -- 3 Stellen: Flag-Variable, Profile-Insert-Refund, Catch-Refund
- `supabase/functions/chat/index.ts` -- 2 Stellen: Flag-Variable, Catch-Refund

