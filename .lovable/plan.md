
## Diagnose (warum der 401 trotz `apikey` weiterhin passiert)

- Dein Request enthält inzwischen **beide** Header:
  - `apikey` (Anon Key) ✅
  - `Authorization: Bearer <user_jwt>` ✅
- Trotzdem kommt **401**, und in den Logs steht `execution_id: null` → die Anfrage wird **vor Ausführung des Codes** geblockt (Gateway/Plattform-Ebene), nicht von deinem Function-Code.
- In `supabase/config.toml` ist aktuell für beide Functions gesetzt:
  - `[functions.multi-ai-query] verify_jwt = true`
  - `[functions.meta-evaluation] verify_jwt = true`
- Deine User-JWTs sind **ES256** (Signing Keys). Genau hier ist das Problem: `verify_jwt = true` ist in der Praxis unzuverlässig/inkompatibel mit Signing-Keys-Setups und führt zu 401, bevor die Function überhaupt läuft.

**Konsequenz:** Wir müssen die “JWT-Verifizierung am Gateway” abschalten und stattdessen **JWT im Code verifizieren**.

---

## Zielzustand

- Gateway lässt Requests durch (`verify_jwt = false`)
- Die Function prüft selbst:
  - Authorization Header vorhanden + `Bearer …`
  - JWT gültig (Claims verifiziert)
  - `userId` aus Claims (`sub`)
- Danach läuft die eigentliche AI-Logik wie bisher (Modelle/Keys bleiben identisch).

---

## Umsetzungsplan

### 1) Backend-Function-Konfiguration anpassen (entscheidend für den 401)
**Datei:** `supabase/config.toml`

- Ändern auf:

```toml
[functions.multi-ai-query]
verify_jwt = false

[functions.meta-evaluation]
verify_jwt = false
```

Warum: Dann blockt das Gateway nicht mehr mit 401, und dein Code kann die Auth sauber selbst validieren.

---

### 2) JWT-Validierung in den Functions korrekt im Code implementieren (Sicherheit bleibt erhalten)

#### 2.1 `supabase/functions/multi-ai-query/index.ts`
Aktuell:
- liest `Authorization`
- nutzt Service-Role Client und `supabase.auth.getUser(token)`

Geplant (robuster + sauberer):
- **Früh** 401 zurückgeben, wenn Header fehlt/ungültig
- JWT **im Code verifizieren** via Claims (Signing Keys kompatibel)
- `userId` aus Claims nutzen

Konkrete Code-Änderungen (Konzept):
- `const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!`
- `const authHeader = req.headers.get('Authorization')`
- `if (!authHeader?.startsWith('Bearer ')) return 401`
- `const token = authHeader.slice('Bearer '.length)`
- `const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } })`
- `const { data, error } = await authClient.auth.getClaims(token)`
  - wenn Fehler → `return 401`
  - `const userId = data.claims.sub`
- Für DB/RPC weiter wie bisher Service Role verwenden (aber ausschließlich mit `userId` aus Claims, nicht aus Request-Body), z.B. `increment_validation_count(userId, …)`.

Zusätzlich:
- Unauthorized darf **nicht** als 500 enden → explizit `return new Response(..., { status: 401 })`.

#### 2.2 `supabase/functions/meta-evaluation/index.ts`
Analog:
- `verify_jwt=false`
- `Authorization` prüfen
- Claims verifizieren → `userId`
- Team-Rollencheck/DB-Write weiter mit Service Role, aber UserId aus Claims.

---

### 3) Frontend bleibt wie es ist (dein letzter Fix ist korrekt)
In `src/hooks/useMultiAIValidation.ts` ist `apikey: SUPABASE_ANON_KEY` bereits drin.
Das behalten wir so bei (auch wenn `verify_jwt=false`), weil es der Standard-Invoke-Mechanismus ist und für das Gateway weiterhin sauber ist.

---

### 4) Test-Checkliste (nach Deployment)
1. Im Browser erneut “KI Analyse erstellen”
2. Erwartung:
   - Kein 401 mehr
   - Request erreicht die Function (du solltest serverseitige Logs wie `Multi-AI query started...` sehen)
3. Falls doch Fehler:
   - Response-Body der Function ansehen (dann wäre es ein “echter” Function-Fehler, kein Gateway-401 mehr)

---

## Risiken / Hinweise
- `verify_jwt=false` macht die Function nicht “offen”, solange wir **im Code** strikt die JWT-Claims prüfen und nur mit der `sub` (User-ID) aus dem Token arbeiten.
- Zusätzlich verbessern wir die Fehlercodes: Unauthorized → 401 statt 500.

---

## Deliverables (was ich nach Freigabe umsetze)
- `supabase/config.toml`: `verify_jwt` für `multi-ai-query` und `meta-evaluation` auf `false`
- `supabase/functions/multi-ai-query/index.ts`: Code-Auth per Claims, saubere 401 Responses
- `supabase/functions/meta-evaluation/index.ts`: Code-Auth per Claims, saubere 401 Responses
