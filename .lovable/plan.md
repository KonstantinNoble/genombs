

# Fix: 401-Fehler bei multi-ai-query Edge Function

## Ursache des Problems

Das Frontend ruft die Edge Function mit:
- `Authorization: Bearer {user_jwt}` ✅
- `apikey: {anon_key}` ❌ **FEHLT**

Supabase Edge Functions mit `verify_jwt = true` benoetigen **beide** Header. Das Fehlen des `apikey` Headers fuehrt zum 401.

## Loesung

Der Frontend-Code in `useMultiAIValidation.ts` muss den `apikey` Header hinzufuegen.

---

## Technische Aenderungen

### Datei: `src/hooks/useMultiAIValidation.ts`

**Zeilen 166-183** - multi-ai-query Aufruf:

```typescript
// VORHER (Zeile 166-183):
const queryResponse = await fetch(
  `${SUPABASE_URL}/functions/v1/multi-ai-query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({...}),
    signal: abortController.signal
  }
);

// NACHHER:
const queryResponse = await fetch(
  `${SUPABASE_URL}/functions/v1/multi-ai-query`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,  // NEU: Anon Key hinzufuegen
    },
    body: JSON.stringify({...}),
    signal: abortController.signal
  }
);
```

**Zeilen 322-342** - meta-evaluation Aufruf:

```typescript
// VORHER:
const evalResponse = await fetch(
  `${SUPABASE_URL}/functions/v1/meta-evaluation`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({...}),
  }
);

// NACHHER:
const evalResponse = await fetch(
  `${SUPABASE_URL}/functions/v1/meta-evaluation`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_ANON_KEY,  // NEU: Anon Key hinzufuegen
    },
    body: JSON.stringify({...}),
  }
);
```

### Datei: `src/lib/supabase/external-client.ts`

Export des Anon Keys hinzufuegen (Zeile 19):

```typescript
// VORHER:
export const SUPABASE_URL = EXTERNAL_SUPABASE_URL;
export const SUPABASE_PROJECT_ID = "fhzqngbbvwpfdmhjfnvk";

// NACHHER:
export const SUPABASE_URL = EXTERNAL_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXTERNAL_SUPABASE_ANON_KEY;  // NEU
export const SUPABASE_PROJECT_ID = "fhzqngbbvwpfdmhjfnvk";
```

### Datei: `src/hooks/useMultiAIValidation.ts`

Import aktualisieren (Zeile 2):

```typescript
// VORHER:
import { supabase, SUPABASE_URL } from '@/lib/supabase/external-client';

// NACHHER:
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/external-client';
```

---

## Zusammenfassung der Aenderungen

| Datei | Aenderung |
|-------|-----------|
| `external-client.ts` | Export `SUPABASE_ANON_KEY` hinzufuegen |
| `useMultiAIValidation.ts` | Import erweitern + `apikey` Header bei beiden fetch-Aufrufen |

---

## Warum das funktioniert

Supabase Edge Functions mit `verify_jwt = true` validieren:
1. **apikey Header**: Muss ein gueltiger Anon oder Service Role Key sein
2. **Authorization Header**: Muss ein gueltiger User JWT sein

Ohne den `apikey` Header lehnt Supabase den Request ab, bevor der Code ueberhaupt laeuft - daher der 401 ohne Logs in der Function selbst.

