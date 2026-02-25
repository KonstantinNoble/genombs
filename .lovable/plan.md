

## Fix: getUserByEmail existiert nicht -- SQL-basierter Lookup

### Problem
`supabase.auth.admin.getUserByEmail()` existiert nicht in supabase-js v2. Alle 3 geaenderten Edge Functions crashen mit:
```
TypeError: supabase.auth.admin.getUserByEmail is not a function
```

### Loesung
Statt der nicht existierenden Methode nutzen wir einen direkten SQL-Query auf die `auth.users` Tabelle. Der Service-Role-Client hat Zugriff darauf, und die Email-Spalte ist indiziert -- also O(1) statt O(n).

### Aenderungen

**1. `supabase/functions/check-email-availability/index.ts` (Zeilen 144-166)**

Ersetze den `getUserByEmail`-Block und den toten Code durch:

```typescript
// Check if email exists in auth.users (direct indexed SQL lookup)
const { data: authUsers, error: queryError } = await supabase
  .from('auth.users' as any)
  .select('id, email, raw_app_meta_data')
  .eq('email', validatedEmail.toLowerCase().trim())
  .limit(1);

// Falls der from('auth.users') Ansatz nicht funktioniert, nutzen wir rpc oder raw query:
// Alternativ: direkter SQL-Query ueber die Supabase REST API
const { data: authUser, error: queryError } = await supabase.rpc('get_user_by_email_lookup', { lookup_email: validatedEmail.toLowerCase().trim() });

// Finale Loesung: Da auth.users nicht direkt per .from() erreichbar ist,
// verwenden wir listUsers mit perPage:1 und einem Workaround,
// ODER wir erstellen eine Datenbank-Funktion die den Lookup macht.
```

Da `auth.users` nicht direkt ueber die PostgREST API erreichbar ist, erstellen wir eine sichere DB-Funktion:

**2. Neue Datenbank-Migration: `get_auth_user_by_email` Funktion**

```sql
CREATE OR REPLACE FUNCTION public.get_auth_user_by_email(lookup_email text)
RETURNS TABLE(id uuid, email text, raw_app_meta_data jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id, email::text, raw_app_meta_data
  FROM auth.users
  WHERE email = lower(lookup_email)
  LIMIT 1;
$$;
```

Diese Funktion:
- Ist `SECURITY DEFINER` (laeuft mit den Rechten des Erstellers, kann auth.users lesen)
- Hat `search_path = ''` (Sicherheits-Best-Practice)
- Nutzt den Index auf `auth.users.email` (O(1))
- Gibt nur die benoetigten Felder zurueck

**3. `supabase/functions/check-email-availability/index.ts` (Zeilen 144-166)**

```typescript
// O(1) indexed lookup via DB function
const { data: authUsers, error: queryError } = await supabase.rpc(
  'get_auth_user_by_email',
  { lookup_email: validatedEmail.toLowerCase().trim() }
);

if (queryError || !authUsers || authUsers.length === 0) {
  return new Response(
    JSON.stringify({ available: true }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

const existingUser = {
  id: authUsers[0].id,
  email: authUsers[0].email,
  app_metadata: authUsers[0].raw_app_meta_data || {}
};

// User exists - check what providers they use
const providers = existingUser.app_metadata?.providers || [];
```

**4. `supabase/functions/check-reset-eligibility/index.ts` (Zeilen 47-64)**

```typescript
const { data: authUsers, error: queryError } = await supabaseAdmin.rpc(
  'get_auth_user_by_email',
  { lookup_email: email.toLowerCase() }
);

if (queryError || !authUsers || authUsers.length === 0) {
  console.log(`No account found for email: ${email}`);
  return new Response(
    JSON.stringify({
      success: false,
      error: "NO_ACCOUNT",
      message: "No account found with this email address. Please create an account first."
    }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

const user = {
  id: authUsers[0].id,
  email: authUsers[0].email,
  app_metadata: authUsers[0].raw_app_meta_data || {}
};
```

**5. `supabase/functions/freemius-webhook/index.ts` (Zeilen 162-167)**

```typescript
const { data: authUsers, error: queryError } = await supabase.rpc(
  'get_auth_user_by_email',
  { lookup_email: userEmail }
);

const authUser = (!queryError && authUsers && authUsers.length > 0) ? authUsers[0] : null;
const profile = authUser ? { id: authUser.id } : null;
```

### Technischer Abschnitt

- `auth.users` ist nicht ueber PostgREST (`.from()`) erreichbar, daher brauchen wir eine `SECURITY DEFINER` DB-Funktion
- Die Funktion wird per `.rpc()` aufgerufen -- das funktioniert in allen supabase-js Versionen
- `auth.users.email` hat einen Index, daher ist der Lookup O(1)
- Die DB-Funktion gibt `raw_app_meta_data` zurueck (das ist das Feld in auth.users, das `app_metadata` bei der Admin-API entspricht) -- damit funktioniert der Provider-Check weiterhin
- Der tote Code in check-email-availability (Zeilen 160-166) wird gleichzeitig entfernt
- Alle 3 Functions werden nach der Aenderung deployed

