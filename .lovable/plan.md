

# Vollständige Migration: Lovable Cloud → Eigenes Supabase-Projekt

## Aktuelle Situation

| Komponente | Zeigt auf | Soll zeigen auf |
|------------|-----------|-----------------|
| `.env` | `fdlyaasqywmdinyaivmw` (Lovable Cloud) | `fhzqngbbvwpfdmhjfnvk` (Dein Supabase) |
| `config.toml` | `fhzqngbbvwpfdmhjfnvk` (Dein Supabase) | `fhzqngbbvwpfdmhjfnvk` (bereits korrekt) |

**Problem:** Die `.env` Datei ist schreibgeschützt und wird von Lovable automatisch verwaltet. Das Frontend verbindet sich noch mit Lovable Cloud.

---

## Was ich tun werde

### Phase 1: Projekt-Konfiguration

Da du das externe Supabase-Projekt bereits mit Lovable verbunden hast, sollte Lovable die `.env` automatisch aktualisieren. Falls nicht, muss ich prüfen ob die Connector-Konfiguration korrekt ist.

**Hinweis:** Die `.env` Datei wird von Lovable automatisch generiert. Wenn du dein externes Supabase-Projekt korrekt verbunden hast, sollte die `.env` automatisch aktualisiert werden.

---

## Was du manuell tun musst

### 1. Im Supabase Dashboard - Secrets setzen

Gehe zu: **Edge Functions → Secrets** und setze folgende 9 Secrets:

| Secret | Quelle |
|--------|--------|
| `LOVABLE_API_KEY` | Lovable Workspace Settings (für AI Gateway) |
| `CLAUDE_API_KEY` | Anthropic Console |
| `PERPLEXITY_API_KEY` | Perplexity Dashboard |
| `RESEND_API_KEY` | Resend Dashboard |
| `FREEMIUS_API_KEY` | Freemius Dashboard |
| `FREEMIUS_PRODUCT_ID` | Freemius Dashboard (21730) |
| `FREEMIUS_PUBLIC_KEY` | Freemius Dashboard |
| `FREEMIUS_SECRET_KEY` | Freemius Dashboard |
| `FIRECRAWL_API_KEY` | Firecrawl Dashboard |

### 2. Im Supabase Dashboard - Authentication konfigurieren

Gehe zu: **Authentication → URL Configuration**

**Site URL:**
```text
https://synoptas.com
```

**Redirect URLs:**
```text
https://synoptas.com/*
https://wealthconomy.lovable.app/*
http://localhost:5173/*
```

### 3. Google OAuth konfigurieren

**Im Google Cloud Console:**
1. https://console.cloud.google.com/apis/credentials
2. Neue Redirect URI hinzufügen:
   ```text
   https://fhzqngbbvwpfdmhjfnvk.supabase.co/auth/v1/callback
   ```

**Im Supabase Dashboard:**
1. Authentication → Providers → Google
2. Client ID und Client Secret eingeben
3. Aktivieren

### 4. Freemius Webhook URL aktualisieren

Im Freemius Dashboard:
```text
https://fhzqngbbvwpfdmhjfnvk.supabase.co/functions/v1/freemius-webhook
```

### 5. Storage Bucket erstellen

Im Supabase Dashboard → Storage:
- Bucket: `website-screenshots`
- Public: Nein (private)

---

## Automatisches Deployment

Sobald die Konfiguration korrekt ist, werden automatisch deployed:

### Edge Functions (12 Stück)
- `multi-ai-query` - Multi-AI Validierung (Lovable AI Gateway + Claude + Perplexity)
- `meta-evaluation` - Meta-Evaluation (Lovable AI Gateway)
- `team-management` - Team-Verwaltung (Resend E-Mails)
- `freemius-webhook` - Zahlungs-Webhooks
- `send-auth-email` - Auth-E-Mails (Resend)
- `register-user` - Benutzer-Registrierung
- `sync-freemius-subscription` - Subscription-Sync
- `delete-account` - Account löschen
- `delete-blocked-account` - Blockierten Account löschen
- `check-deleted-account-block` - Block-Prüfung
- `check-email-availability` - E-Mail-Verfügbarkeit
- `check-reset-eligibility` - Reset-Berechtigung

### Datenbank-Schema (104 Migrations)
- 17 Tabellen (profiles, user_credits, teams, etc.)
- 50+ RLS Policies
- 17+ Database Functions
- Custom Types (app_role, team_role)

---

## Cron Jobs

Für Cron Jobs (z.B. `cleanup_old_deleted_accounts`, `deactivate_expired_subscriptions`) musst du pg_cron im Supabase Dashboard aktivieren:

1. **Extensions aktivieren:** Database → Extensions → `pg_cron` und `pg_net` aktivieren

2. **Cron Jobs einrichten:**
```sql
-- Beispiel: Gelöschte Accounts nach 24h bereinigen
SELECT cron.schedule(
  'cleanup-deleted-accounts',
  '0 * * * *', -- Stündlich
  $$SELECT public.cleanup_old_deleted_accounts()$$
);

-- Abgelaufene Subscriptions deaktivieren
SELECT cron.schedule(
  'deactivate-expired-subscriptions',
  '0 0 * * *', -- Täglich um Mitternacht
  $$SELECT public.deactivate_expired_subscriptions()$$
);

-- Unbestätigte User nach 7 Tagen löschen
SELECT cron.schedule(
  'cleanup-unconfirmed-users',
  '0 2 * * *', -- Täglich um 2 Uhr
  $$SELECT public.cleanup_unconfirmed_users()$$
);

-- Abgelaufene Einladungen löschen
SELECT cron.schedule(
  'cleanup-expired-invitations',
  '0 3 * * *', -- Täglich um 3 Uhr
  $$SELECT public.cleanup_expired_invitations()$$
);

-- Alte Webhook-Events bereinigen
SELECT cron.schedule(
  'cleanup-old-webhook-events',
  '0 4 * * 0', -- Wöchentlich (Sonntag um 4 Uhr)
  $$SELECT public.cleanup_old_processed_events()$$
);
```

---

## Wichtiger Hinweis: Lovable AI Gateway

Der **Lovable AI Gateway** (`ai.gateway.lovable.dev`) wird weiterhin funktionieren, solange du einen gültigen `LOVABLE_API_KEY` im neuen Supabase-Projekt setzt. Dieser ist **nicht** an Lovable Cloud gebunden, sondern an deinen Lovable Account.

---

## Zusammenfassung

| Aufgabe | Verantwortlich | Status |
|---------|---------------|--------|
| `config.toml` aktualisieren | Lovable | Bereits erledigt |
| Edge Functions deployen | Automatisch | Nach Build |
| Migrations ausführen | Automatisch | Nach Build |
| Secrets setzen | Du | Manuell im Dashboard |
| Google OAuth konfigurieren | Du | Manuell |
| Freemius Webhook URL ändern | Du | Manuell |
| Storage Bucket erstellen | Du | Manuell |
| Cron Jobs einrichten | Du | Manuell im SQL Editor |

---

## Nächster Schritt

Ich werde jetzt prüfen, ob die Connector-Verbindung korrekt ist und die `.env` automatisch aktualisiert wird. Falls die `.env` noch auf Lovable Cloud zeigt, muss die Connector-Konfiguration überprüft werden.

**Wichtig:** Da die `.env` von Lovable automatisch verwaltet wird, sollte sie sich automatisch aktualisieren, wenn das externe Supabase-Projekt korrekt verbunden ist. Falls nicht, teile mir bitte mit, welche Fehlermeldung du siehst.

