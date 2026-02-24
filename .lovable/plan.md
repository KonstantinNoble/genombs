

## Problem
Beim Upgrade von Free auf Premium wird `daily_credits_limit` korrekt von 20 auf 100 erhoeht (ueber den DB-Trigger `sync_credits_limit`), aber `credits_used` wird **nicht zurueckgesetzt**. Dadurch bleiben bereits verbrauchte Credits bestehen und der User startet mit weniger als 100 Credits.

**Beispiel:** User hatte 36 von 20 Credits verbraucht -> nach Upgrade: `credits_used=36`, `daily_credits_limit=100` -> Anzeige: 64/100 statt 100/100.

## Loesung

### 1) DB-Trigger `sync_credits_limit` erweitern
**Datei:** Datenbank-Migration

Den bestehenden Trigger so aendern, dass beim Wechsel von `is_premium=false` auf `is_premium=true`:
- `credits_used` auf `0` zurueckgesetzt wird
- `credits_reset_at` auf `now() + 24h` zurueckgesetzt wird

Damit startet der User mit einem vollen Credit-Budget (100/100).

```text
Vorher (Trigger):
  is_premium false -> true:  daily_credits_limit = 100

Nachher (Trigger):
  is_premium false -> true:  daily_credits_limit = 100
                              credits_used = 0
                              credits_reset_at = now() + 24h
```

### 2) Gleiche Logik fuer Downgrade (Premium -> Free)
Beim Wechsel von `is_premium=true` auf `is_premium=false`:
- `credits_used` auf `0` zuruecksetzen
- `credits_reset_at` auf `now() + 24h` zuruecksetzen

Damit bekommt der User auch beim Downgrade ein frisches Budget (20/20).

### Kein Code-Aenderung noetig
Da die gesamte Logik im DB-Trigger liegt und die Webhook-/Frontend-Logik `is_premium` bereits korrekt setzt, sind keine Aenderungen an Edge Functions oder Frontend-Code noetig.

## Technischer Abschnitt

Angepasste Trigger-Funktion:
```text
sync_credits_limit():
  IF is_premium changed (false->true OR true->false):
    - Set daily_credits_limit (100 or 20)
    - Reset credits_used = 0
    - Reset credits_reset_at = now() + interval '24 hours'
```

## Validierung
1. Free User mit teilweise verbrauchten Credits upgraded -> sollte 100/100 haben.
2. Premium User downgraded -> sollte 20/20 haben.
3. Normaler Credit-Verbrauch nach Upgrade funktioniert wie erwartet.
