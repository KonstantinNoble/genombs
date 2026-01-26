
Ziel
- Team-Einladungen sollen für nicht registrierte Nutzer zuverlässig funktionieren: Link öffnen → „Sign in to accept“ sehen → nach Registrierung/Login automatisch wieder zum Invite zurück → Einladung wird angenommen.

Was ich aktuell als Hauptursache vermute
- Die Einladungs-E-Mail baut den Link immer mit einer fest verdrahteten URL (`SITE_URL = https://wealthconomy.lovable.app`).
- Wenn eine Einladung aus der Vorschau/Test-Umgebung erstellt wurde, landet der Empfänger trotzdem auf der veröffentlichten Seite. Dort existiert der Token in der anderen Datenbank/Umgebung nicht → die Einladung wirkt „invalid“, besonders auffällig bei nicht registrierten Nutzern (die den Link aus der E-Mail nutzen).
- Zusätzlich ist die Fehleranzeige in `TeamInvite.tsx` derzeit zu wenig aussagekräftig, wenn die Backend-Funktion einen Nicht‑2xx Status zurückgibt.

Umsetzung (konkret)
1) Backend-Funktion: Invite-Link dynamisch korrekt setzen
   - Datei: `supabase/functions/team-management/index.ts`
   - Änderung:
     - `SITE_URL` nicht mehr hardcoden, sondern pro Request ermitteln.
     - Quelle für die URL:
       1) `body.siteUrl` (wird vom Frontend mit `window.location.origin` mitgeschickt) – bevorzugt
       2) Fallback: `Origin`/`Referer` Header (Origin daraus extrahieren)
       3) Letzter Fallback: `https://wealthconomy.lovable.app`
     - `sendInviteEmail(...)` um einen Parameter `siteUrl` erweitern und `inviteUrl = \`\${siteUrl}/team/invite/\${token}\`` erzeugen.
   - Sicherheits-/Stabilitäts-Details:
     - `siteUrl` validieren (nur `https://…` und nur erlaubte Hosts wie `*.lovable.app`, `*.lovableproject.com` sowie ggf. eigene Domain). Bei Ungültigkeit → Fallback verwenden.
   - Logging ergänzen:
     - Beim `invite`-Case: logge `siteUrl`, `teamId`, `email`, `token` (Token ggf. gekürzt loggen) – damit wir künftig sofort sehen, wohin der Link zeigt.

2) Frontend: Beim Einladen `siteUrl` mitsenden
   - Datei: `src/pages/TeamMembers.tsx`
   - Änderung:
     - In `handleInvite` beim Aufruf `supabase.functions.invoke("team-management", …)` den Body um `siteUrl: window.location.origin` erweitern.
   - Ergebnis:
     - Einladungen, die in Preview erstellt werden, bekommen Preview-Links.
     - Einladungen, die in Published erstellt werden, bekommen Published-Links.

3) Frontend: TeamInvite robuster machen (bessere Anzeige + weniger “stille” Fehler)
   - Datei: `src/pages/TeamInvite.tsx`
   - Änderungen:
     A) Fehler aus der Backend-Funktion besser auslesen
        - Wenn `response.error` gesetzt ist (typisch bei HTTP 4xx/5xx), zusätzlich versuchen, die Response-Body-Message zu extrahieren (z.B. `{ error: "...", message: "..." }`) und diese als `errorMessage` anzeigen.
        - Damit ist für Nutzer sichtbar, ob es wirklich “Invalid/expired invitation” ist oder etwas anderes.
     B) Klare States für nicht eingeloggte Nutzer
        - Wenn `authLoading` fertig ist und `user == null`:
          - Wir lassen weiterhin den Backend-Check laufen (um Teamname/E-Mail zu bekommen), aber:
            - Wenn dabei ein 401/403 oder „Missing authorization/Invalid token“ kommt, wechseln wir nicht stumpf auf „error“, sondern zeigen „requiresAuth“ (mit generischem Teamname falls nötig) und leiten sauber zum Login.
          - Vorteil: selbst wenn ein Auth-Header/Session merkwürdig ist, bekommt der Nutzer nicht sofort “Invitation Error”, sondern den korrekten „Sign in to accept“-Flow.
     C) Optional: Token bereits beim Anzeigen des Login-Screens speichern
        - Wenn wir im „requiresAuth“-State sind: `localStorage.setItem("pending_team_invite", token)` (falls noch nicht gesetzt)
        - Dann reicht ein normales Login/Signup und `AuthCallback.tsx` leitet automatisch zurück.

4) Testplan (kurz, aber eindeutig)
   - Test 1 (Published → non-registered):
     1) In Published einladen (an eine E-Mail ohne Account)
     2) Link in Incognito öffnen
     3) Erwartung: „Join {team}“ / „Sign in to accept“ erscheint (kein Fehler)
     4) Signup/Login durchführen
     5) Erwartung: nach Callback automatisch wieder `/team/invite/:token` und danach „Welcome to {team}“
   - Test 2 (Preview → non-registered):
     1) In Preview einladen
     2) Prüfen, dass der Link in der E-Mail auf die Preview-Domain zeigt
     3) Flow wie oben
   - Test 3 (alte/überschriebene Links):
     1) Gleiche E-Mail zweimal einladen (beachte: DB hat UNIQUE(team_id,email), Token wird überschrieben)
     2) Alter Link muss „Invalid/expired invitation“ anzeigen (jetzt mit guter Fehlermeldung), neuer Link muss funktionieren

Hinweis zu einem möglichen weiteren “stolperstein” (wenn du willst, lösen wir das als Nächstes)
- Weil `team_invitations` `UNIQUE(team_id,email)` hat, wird bei “nochmal einladen” der Token überschrieben. Ein alter Link ist dann tatsächlich ungültig. Das ist technisch korrekt, kann aber verwirrend sein. Wenn du möchtest, können wir das Datenmodell so ändern, dass mehrere Einladungen historisch gültig bleiben (mit sauberem Cleanup). Das wäre ein separater Schritt (DB-Migration + Anpassung Invite-Logik).

Ergebnis
- Nicht registrierte Nutzer bekommen konsistent den richtigen Login-/Signup-Flow.
- Einladungslinks zeigen immer auf die passende Umgebung (Preview vs Published), dadurch verschwinden die “immer noch nicht”-Fälle, die durch Umgebungs-Mismatch entstehen.
- Fehlertexte werden nachvollziehbar, falls wirklich ein ungültiger/alter Token genutzt wird.
