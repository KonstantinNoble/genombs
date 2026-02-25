

## Fix: Skalierbare User-Lookups mit korrektem Error-Handling

### Problem
3 Edge Functions laden alle User via `listUsers()` und filtern per JS. Das skaliert nicht. Die Loesung `getUserByEmail()` erfordert aber korrektes Error-Handling, da die API bei "User nicht gefunden" einen Error wirft statt `null` zurueckzugeben.

### Aenderungen

**1. `supabase/functions/check-email-availability/index.ts` (Zeilen 144-156)**

Hier ist "nicht gefunden" der Erfolgsfall (Email ist verfuegbar):

```text
// Vorher:
const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) { ... }
const existingUser = usersData.users.find(u => u.email?.toLowerCase() === validatedEmail.toLowerCase().trim());

// Nachher:
const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(
  validatedEmail.toLowerCase().trim()
);

// getUserByEmail wirft Error wenn User nicht existiert
// In diesem Fall ist die Email verfuegbar
if (userError || !userData?.user) {
  return new Response(
    JSON.stringify({ available: true }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

const existingUser = userData.user;
// Ab hier weiter wie bisher mit existingUser (Provider-Check etc.)
```

**2. `supabase/functions/check-reset-eligibility/index.ts` (Zeilen 47-55)**

Hier ist "nicht gefunden" ein normaler Fall mit spezifischer Antwort:

```text
// Vorher:
const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
if (listError) { throw new Error("Failed to check user existence"); }
const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

// Nachher:
const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(
  email.toLowerCase()
);

if (userError || !userData?.user) {
  // User nicht gefunden -- gleiche Antwort wie vorher
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

const user = userData.user;
// Ab hier weiter wie bisher mit user (Provider-Check, Rate-Limit, Reset-Link etc.)
```

**3. `supabase/functions/freemius-webhook/index.ts` (Zeilen 165-178)**

Hier ist "nicht gefunden" der Pending-Premium-Fall:

```text
// Vorher:
const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
if (usersError) { ... }
const authUser = users?.find(u => u.email?.toLowerCase() === userEmail);
const profile = authUser ? { id: authUser.id } : null;

// Nachher:
const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(userEmail);

// Bei Error oder nicht gefunden: profile bleibt null -> Pending-Premium-Flow
const authUser = (!userError && userData?.user) ? userData.user : null;
const profile = authUser ? { id: authUser.id } : null;
// Ab hier weiter wie bisher (if !profile -> pending_premium Logik)
```

### Technischer Abschnitt

Kernpunkt: `getUserByEmail()` hat ein anderes Verhalten als `listUsers().find()`:
- `listUsers().find()`: gibt `undefined` zurueck wenn kein Match
- `getUserByEmail()`: gibt einen Error zurueck wenn User nicht existiert

Deshalb pruefen wir immer `if (userError || !userData?.user)` statt nur `if (!user)`.

Das Error-Handling ist dabei kontextabhaengig:
- **check-email-availability**: Error = Email verfuegbar (Erfolgsfall)
- **check-reset-eligibility**: Error = Kein Account gefunden (Fehlermeldung an User)
- **freemius-webhook**: Error = User noch nicht registriert (Pending-Premium-Flow)

Alle 3 Functions werden nach der Aenderung deployed.

