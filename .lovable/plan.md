
Problemverständnis (aus Code + Logs)
- Der Einladungslink zeigt auf synoptas.com und beim Öffnen siehst du „Invitation Error“ (bei eingeloggten und nicht eingeloggten Nutzern).
- Die Backend-Funktion `team-management` wird tatsächlich mit `action: accept-invite` aufgerufen (Logs zeigen `accept-invite, user: null` und auch `accept-invite, user: <uuid>`). Das heißt: Route wird geladen, und das Problem liegt in der Fehlerbehandlung/Flow-Logik.
- Aktuell gibt die Backend-Funktion bei Fehlerfällen (z.B. Email-Mismatch, Invite ungültig/abgelaufen, Team voll) HTTP-Status 403/404 zurück.
- In `src/pages/TeamInvite.tsx` wird bei `response.error` sofort auf den generischen Error-State gewechselt – ohne den JSON-Body der Fehlantwort auszulesen. Dadurch wird z.B. ein sauberer `EMAIL_MISMATCH`-Fall (eigener UI-State vorhanden!) als „Invitation Error“ angezeigt. Das ist sehr wahrscheinlich der Grund, warum “alles kaputt” wirkt.

Ziel
- Einladungen funktionieren wieder für:
  - Nicht eingeloggte Nutzer: „Sign in to accept“ → Login/Signup → Einladung kann angenommen werden
  - Eingeloggte Nutzer: Link öffnen → Einladung wird direkt angenommen (oder sauberer „Wrong account“-Hinweis)

Umsetzungsschritte (konkret)

1) TeamInvite: Fehler-Body auch bei non-2xx auslesen und korrekt mappen
Datei: `src/pages/TeamInvite.tsx`
- Wenn `response.error` gesetzt ist:
  - Versuchen, den Response-Body aus `response.error.context` (Supabase FunctionsHttpError Response) als JSON zu parsen.
  - Danach State korrekt setzen, z.B.:
    - `EMAIL_MISMATCH` → `setState("emailMismatch")` + `invitedEmail`
    - `TEAM_FULL` → `setState("error")` + passende Message
    - `Invalid or expired invitation` → `setState("error")` + klare Message („Invite ungültig/abgelaufen“)
    - `Missing authorization`/`Invalid token` → `setState("requiresAuth")` (wenn user fehlt)
- Ergebnis: Statt generischem „Invitation Error“ sehen Nutzer die richtige Ursache und den richtigen nächsten Schritt.

2) TeamInvite: Auth-Token explizit mitsenden (stabiler, konsistent zum Rest der App)
Datei: `src/pages/TeamInvite.tsx`
- Vor `supabase.functions.invoke` einmal `supabase.auth.getSession()` holen.
- Wenn Session vorhanden:
  - `headers: { Authorization: \`Bearer ${session.access_token}\` }` mitsenden.
- Wenn keine Session:
  - ohne Header callen (damit `requiresAuth` sauber zurückkommt).
- Hintergrund: In anderen Teilen (TeamContext/TeamMembers) wird Authorization immer explizit gesetzt; TeamInvite war hiervon abweichend. Das macht den Flow robuster über Domains/Browser hinweg.

3) Backend: accept-invite Fehlerfälle als 200 + structured payload zurückgeben (optional, aber empfohlen)
Datei: `supabase/functions/team-management/index.ts` (Case `"accept-invite"`)
- Um das `response.error`-Problem dauerhaft zu eliminieren, stellen wir auf ein einheitliches Response-Schema um:
  - Immer `status: 200` bei erwartbaren Business-Fehlern (Invite invalid, mismatch, team full), z.B.:
    - `{ ok: false, error: "INVITE_INVALID" }`
    - `{ ok: false, error: "EMAIL_MISMATCH", invitedEmail }`
    - `{ ok: false, error: "TEAM_FULL" }`
    - `{ ok: false, requiresAuth: true, email, teamName }`
  - Nur echte Systemfehler bleiben 500.
- Parallel dazu passt TeamInvite die Mapping-Logik auf diese Codes an (auch einfacher zu warten).
- Bonus-Fix: Beim `alreadyMember`-Return zusätzlich `teamId` und `teamName` mitsenden (damit der UI-State keine leeren Werte hat).

4) Login-Flow ohne Storage: returnTo per URL statt localStorage (damit es auch ohne pending_team_invite “smooth” ist)
Dateien: `src/pages/TeamInvite.tsx`, `src/pages/Auth.tsx`, `src/pages/AuthCallback.tsx`
- Du wolltest Storage komplett entfernen; aktuell bedeutet das aber, dass nach Login der Invite nicht automatisch weiterläuft.
- Lösung ohne Storage:
  - In TeamInvite bei „Sign In to Accept“: navigiere zu `/auth?intent=invite&email=...&returnTo=/team/invite/<token>`
  - In Auth.tsx:
    - `email` QueryParam auslesen und ins Formular vorbefüllen
    - `returnTo` QueryParam beim Login/Signup/OAuth weiterreichen:
      - Email/Pass Login: `navigate("/auth/callback?returnTo=...")`
      - Google OAuth: `redirectTo: ".../auth/callback?returnTo=..."`
      - register-user redirectUrl: `".../auth/callback?returnTo=..."`
    - Bei bereits eingeloggtem User nicht stumpf auf `/` redirecten, sondern wenn `returnTo` existiert → direkt dahin.
  - In AuthCallback.tsx:
    - `returnTo` aus QueryParam lesen und nach erfolgreichem Login dorthin navigieren
    - Den alten `pending_team_invite` localStorage-Block entfernen (weil du Storage dafür nicht willst)
- Ergebnis: Nahtloser Invite-Flow ohne sessionStorage/localStorage.

5) Testplan (konkret, damit wir sofort sehen ob es wirklich gefixt ist)
A) Nicht eingeloggter Nutzer (Inkognito)
- Invite an E-Mail X senden
- Link öffnen → muss „Join … / Sign in to accept“ zeigen (nicht Invitation Error)
- Login/Signup mit E-Mail X → nach Callback automatisch zurück zur Einladung → „Welcome to …“

B) Eingeloggter Nutzer mit gleicher E-Mail wie Einladung
- Link öffnen → sollte direkt „Welcome to …“ zeigen

C) Eingeloggter Nutzer mit anderer E-Mail als Einladung
- Link öffnen → sollte „Wrong account“ (emailMismatch) zeigen (nicht Invitation Error)

Risiken / Edge Cases
- Alte Einladungslinks können legitimerweise ungültig werden, wenn dieselbe E-Mail erneut eingeladen wurde (Token wird überschrieben). Mit dem neuen Error-Handling ist das klar und verständlich sichtbar.
- Wenn synoptas.com tatsächlich nicht auf dieselbe App zeigt oder umleitet, müssen wir zusätzlich auf ein Link-Format wechseln, das immer `/` lädt (z.B. `https://synoptas.com/?invite=<token>` + App-internes Redirect). Aktuell sieht es aber nach App-Ladepfad aus, weil accept-invite Calls in Logs auftauchen.

Umfang: Dateien die wir anfassen werden
- `src/pages/TeamInvite.tsx` (Hauptfix)
- `supabase/functions/team-management/index.ts` (accept-invite Response vereinheitlichen + alreadyMember payload)
- `src/pages/Auth.tsx` (email/returnTo aus URL, weiterreichen)
- `src/pages/AuthCallback.tsx` (returnTo handling, pending_team_invite entfernen)

Erwartetes Ergebnis
- Keine generischen „Invitation Error“-Screens mehr für normale Fälle.
- Einladungen funktionieren wieder vollständig, ohne Token in Browser-Storage zu speichern.
