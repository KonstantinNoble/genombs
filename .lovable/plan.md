

# Fix: Profile-Loeschung ueber Server-Side Edge Function

## Ursache

Das Delete schlaegt nicht mit einem Fehler fehl — es loescht einfach **0 Zeilen** ohne Fehlermeldung. Das ist Standard-Verhalten von Supabase: Wenn RLS (Row Level Security) den Zugriff blockiert, gibt `.delete()` keinen Fehler zurueck, sondern loescht einfach nichts.

Die Profile werden vom Edge Function `analyze-website` mit dem **Service Role Key** (Admin-Rechte) eingefuegt. Wenn der Client-Side Delete mit dem normalen User-Token versucht wird, stimmt `auth.uid()` moeglicherweise nicht mit dem gespeicherten `user_id` ueberein, weil die Auth-Sessions zwischen Lovable Cloud und dem externen Backend unterschiedlich sein koennen.

## Loesung

Eine neue Edge Function `delete-profiles` erstellen, die den Service Role Key nutzt — genau wie die Erstellung auch serverseitig laeuft.

### Aenderung 1: Neue Edge Function `supabase/functions/delete-profiles/index.ts`

- Empfaengt `conversationId` per POST
- Authentifiziert den User ueber JWT
- Verwendet den Service Role Key (Admin-Client) fuer die Loeschung
- Loescht zuerst `improvement_tasks`, dann `website_profiles`
- Gibt die Anzahl geloeschter Eintraege zurueck

### Aenderung 2: `src/lib/api/chat-api.ts`

- `deleteProfilesForConversation` wird umgeschrieben: statt direkte DB-Aufrufe wird die neue Edge Function aufgerufen
- Nutzt denselben Auth-Token wie die anderen Edge Function Aufrufe
- Vereinfachte Fehlerbehandlung, da die Edge Function die Arbeit macht

### Aenderung 3: `src/pages/Chat.tsx`

- `handleScan` uebergibt den Access Token an die Delete-Funktion
- Signatur von `deleteProfilesForConversation` aendern, um `accessToken` zu akzeptieren

### Aenderung 4: `supabase/config.toml`

- Neuen Eintrag fuer `delete-profiles` mit `verify_jwt = false` (Validierung im Code)

## Zusammenfassung

| Datei | Aenderung |
|---|---|
| `supabase/functions/delete-profiles/index.ts` | Neue Edge Function fuer serverseitige Loeschung |
| `src/lib/api/chat-api.ts` | Delete-Funktion ruft Edge Function statt direkte DB auf |
| `src/pages/Chat.tsx` | Access Token an Delete-Funktion uebergeben |
| `supabase/config.toml` | Eintrag fuer neue Edge Function |

