

## Edge Function Build-Fehler beheben (22 TypeScript-Fehler)

### Ursache
Die Edge Functions verwenden `createClient` ohne generisches Datenbank-Schema. Dadurch ist der Rueckgabetyp von `.from().select().single()` intern `never`, und jeder Property-Zugriff (`data.credits_used`, `credits.id`, etc.) wird als Fehler gemeldet. Die Funktionen laufen zur Laufzeit korrekt -- es sind reine Compile-Zeit-Fehler.

### Loesung
Explizite Typ-Interfaces fuer die Query-Ergebnisse definieren und die Supabase-Queries entsprechend casten.

---

### Aenderungen

#### 1. `supabase/functions/chat/index.ts` (19 Fehler)

**Typ-Interfaces hinzufuegen (nach den Imports):**
```typescript
interface CreditRow {
  id: string;
  credits_used: number;
}
interface CreditFullRow {
  id: string;
  is_premium: boolean;
  daily_credits_limit: number;
  credits_used: number;
  credits_reset_at: string;
}
```

**`refundCredits` Funktion (Zeile 332-333):**
- Parameter-Typ von `ReturnType<typeof createClient>` auf `any` aendern
- Query-Ergebnis casten: `const { data } = ... as { data: CreditRow | null }`

**`checkAndDeductCredits` Funktion (Zeile 360-361):**
- Parameter-Typ auf `any` aendern
- Query-Ergebnis casten: `const { data: credits, ... } = ... as { data: CreditFullRow | null, error: any }`

**Aufrufe (Zeilen 476, 552, 588):**
- `supabaseAdmin as any` entfaellt, da der Parameter jetzt `any` akzeptiert

#### 2. `supabase/functions/analyze-website/index.ts` (11 Fehler)

**Gleiche Typ-Interfaces hinzufuegen.**

**`refundCredits` Funktion (Zeile ~395):**
- Parameter-Typ auf `any` aendern + Query-Cast

**`checkAnalysisCredits` Funktion (Zeile ~427):**
- Parameter-Typ auf `any` aendern
- `baseCredits` Query casten: `as { data: { id: string; is_premium: boolean } | null, error: any }`
- `credits` Query casten: `as { data: CreditFullRow | null, error: any }`

**Aufruf (Zeile 546):**
- Kein Cast mehr noetig

#### 3. `supabase/functions/process-analysis-queue/index.ts` (1 Fehler)

**Zeile 608:**
```typescript
// Vorher:
const slotsAvailable = Math.max(0, maxConcurrent - processingCount);
// Nachher:
const slotsAvailable = Math.max(0, maxConcurrent - (processingCount ?? 0));
```

---

### Zusammenfassung
- 3 Dateien betroffen
- Keine Logik-Aenderungen, nur Typ-Annotationen und ein Null-Safety-Fix
- Runtime-Verhalten bleibt identisch
- Alle 22 Build-Fehler werden behoben
