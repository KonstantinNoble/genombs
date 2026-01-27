

# Migrationsplan: Edge Functions und Datenbank auf Supabase deployen

## Übersicht

Du hast dein neues Supabase-Projekt (`fhzqngbbvwpfdmhjfnvk`) mit Lovable verbunden. Ich werde die Konfiguration aktualisieren, sodass alle Edge Functions und Datenbank-Migrationen automatisch auf dein neues Projekt deployed werden.

## Deine neuen Supabase-Credentials

| Feld | Wert |
|------|------|
| **Project URL** | `https://fhzqngbbvwpfdmhjfnvk.supabase.co` |
| **Project ID** | `fhzqngbbvwpfdmhjfnvk` |
| **Anon Key** | `eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9...` (aus Screenshot) |

## Was automatisch passiert

Wenn Lovable korrekt mit deinem Supabase-Projekt verbunden ist:
1. Die `.env` Datei wird automatisch aktualisiert
2. Die `supabase/config.toml` wird aktualisiert
3. Edge Functions werden automatisch deployed
4. Migrations werden automatisch ausgeführt

## Phase 1: Konfiguration aktualisieren

### 1.1 `.env` Datei aktualisieren

```text
VITE_SUPABASE_PROJECT_ID="fhzqngbbvwpfdmhjfnvk"
VITE_SUPABASE_PUBLISHABLE_KEY="[NEUER_ANON_KEY]"
VITE_SUPABASE_URL="https://fhzqngbbvwpfdmhjfnvk.supabase.co"
```

### 1.2 `supabase/config.toml` aktualisieren

```toml
project_id = "fhzqngbbvwpfdmhjfnvk"
```

---

## Phase 2: Edge Functions (12 Stück)

Diese Edge Functions werden automatisch deployed:

| Function | Beschreibung | JWT |
|----------|--------------|-----|
| `multi-ai-query` | Multi-AI Validierung | true |
| `meta-evaluation` | Meta-Evaluation | true |
| `team-management` | Team-Verwaltung | false |
| `freemius-webhook` | Zahlungs-Webhooks | false |
| `send-auth-email` | Auth-E-Mails | false |
| `register-user` | Benutzer-Registrierung | false |
| `sync-freemius-subscription` | Subscription-Sync | true |
| `delete-account` | Account löschen | true |
| `delete-blocked-account` | Blockierten Account löschen | true |
| `check-deleted-account-block` | Block-Prüfung | false |
| `check-email-availability` | E-Mail-Verfügbarkeit | false |
| `check-reset-eligibility` | Reset-Berechtigung | false |

---

## Phase 3: Datenbank-Schema (104 Migrations)

Die folgenden Tabellen werden erstellt:

| Tabelle | Beschreibung |
|---------|--------------|
| `profiles` | Benutzerprofile |
| `user_credits` | Premium-Status, Validierungslimits |
| `user_roles` | Admin/Moderator-Rollen |
| `validation_analyses` | Validierungshistorie |
| `decision_records` | Entscheidungsprotokolle |
| `decision_audit_log` | Audit-Trail |
| `experiments` | Experimente |
| `experiment_tasks` | Experiment-Aufgaben |
| `experiment_checkpoints` | Checkpoints |
| `experiment_evidence` | Evidenz |
| `teams` | Team-Workspaces |
| `team_members` | Team-Mitgliedschaften |
| `team_invitations` | Einladungen |
| `deleted_accounts` | 24h Account-Block |
| `pending_premium` | Pending Premium-Status |
| `processed_webhook_events` | Webhook-Deduplizierung |
| `registration_attempts` | Rate-Limiting |

---

## Phase 4: Secrets übertragen (manuell erforderlich)

Die folgenden Secrets müssen in deinem **neuen Supabase-Projekt** unter **Edge Functions → Secrets** gesetzt werden:

| Secret | Beschreibung |
|--------|--------------|
| `LOVABLE_API_KEY` | Für Lovable AI Gateway |
| `CLAUDE_API_KEY` | Für Claude Sonnet 4 |
| `PERPLEXITY_API_KEY` | Für Perplexity Modelle |
| `RESEND_API_KEY` | Für E-Mail-Versand |
| `FREEMIUS_API_KEY` | Für Subscription-Sync |
| `FREEMIUS_PRODUCT_ID` | Produkt-ID |
| `FREEMIUS_PUBLIC_KEY` | Öffentlicher Schlüssel |
| `FREEMIUS_SECRET_KEY` | Webhook-Signatur |
| `FIRECRAWL_API_KEY` | Für Web-Scraping |

**Wichtig:** Diese Secrets müssen manuell im Supabase Dashboard gesetzt werden, da Lovable keinen direkten Zugriff auf die Supabase Secrets hat.

---

## Phase 5: Auth-Konfiguration (manuell erforderlich)

Im Supabase Dashboard unter **Authentication → URL Configuration**:

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

---

## Phase 6: Google OAuth (manuell erforderlich)

### Im Google Cloud Console:
1. Gehe zu https://console.cloud.google.com/apis/credentials
2. Füge neue Redirect URI hinzu:
   ```text
   https://fhzqngbbvwpfdmhjfnvk.supabase.co/auth/v1/callback
   ```

### Im Supabase Dashboard:
1. Authentication → Providers → Google
2. Client ID und Client Secret eingeben
3. Aktivieren

---

## Phase 7: Freemius Webhook (manuell erforderlich)

Im Freemius Dashboard die Webhook-URL aktualisieren:

**Neue URL:**
```text
https://fhzqngbbvwpfdmhjfnvk.supabase.co/functions/v1/freemius-webhook
```

---

## Phase 8: Storage Bucket (manuell erforderlich)

Im Supabase Dashboard → Storage:
1. Neuen Bucket erstellen: `website-screenshots`
2. Public: Nein (private)

---

## Technische Details

### Zu aktualisierende Dateien

1. **`.env`** - Neue Supabase-Credentials
2. **`supabase/config.toml`** - Neue Project-ID

### Automatisches Deployment

Nach der Konfigurationsänderung werden automatisch:
- 12 Edge Functions deployed
- 104 Migrations ausgeführt
- 17 Tabellen erstellt
- 50+ RLS Policies angewendet
- 17+ Database Functions erstellt

---

## Zusammenfassung

| Aufgabe | Wer | Status |
|---------|-----|--------|
| `.env` aktualisieren | Lovable | Wird implementiert |
| `config.toml` aktualisieren | Lovable | Wird implementiert |
| Edge Functions deployen | Automatisch | Nach Konfiguration |
| Migrations ausführen | Automatisch | Nach Konfiguration |
| Secrets im Supabase Dashboard setzen | Du | Manuell erforderlich |
| Google OAuth konfigurieren | Du | Manuell erforderlich |
| Freemius Webhook URL ändern | Du | Manuell erforderlich |
| Storage Bucket erstellen | Du | Manuell erforderlich |

---

## Nächste Schritte nach Genehmigung

1. Ich aktualisiere `.env` und `config.toml` mit der neuen Project-ID
2. Die Edge Functions werden automatisch deployed
3. Die Migrations werden automatisch ausgeführt
4. Du setzt die Secrets im Supabase Dashboard
5. Du konfigurierst Google OAuth und Freemius Webhook
6. Gemeinsames Testing

