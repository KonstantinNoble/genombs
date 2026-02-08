
# Synoptas komplett aufraumen -- nur Infrastruktur behalten

## Ziel
Alle Feature-spezifischen Funktionalitaten entfernen und nur die Kern-Infrastruktur behalten: Authentifizierung, Freemius-Zahlungsintegration, Webhooks, Account-Management und die grundlegende App-Struktur.

---

## Was bleibt erhalten (Infrastruktur)

### Frontend
- **Auth-System**: `Auth.tsx`, `AuthCallback.tsx`, `ResetPassword.tsx`, `UpdatePassword.tsx`, `AuthContext.tsx`
- **Profil**: `Profile.tsx` (mit Premium-Status und Account-Loschung)
- **Freemius Checkout**: `useFreemiusCheckout.ts`
- **Statische Seiten**: `Contact.tsx`, `Pricing.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`, `Imprint.tsx`
- **Basis-Komponenten**: `Navbar.tsx`, `Footer.tsx`, `ErrorBoundary.tsx`, `ScrollToTop.tsx`, alle `ui/`-Komponenten, `seo/`-Komponenten
- **Basis-Infrastruktur**: `App.tsx`, `main.tsx`, `external-client.ts`, `utils.ts`, `constants.ts`

### Edge Functions (bleiben)
- `check-deleted-account-block` -- GDPR Account-Sperre
- `check-email-availability` -- Registrierungs-Prufung
- `check-reset-eligibility` -- Passwort-Reset-Prufung
- `delete-account` -- GDPR Account-Loschung
- `delete-blocked-account` -- Blockierte Accounts loschen
- `freemius-webhook` -- Zahlungs-Webhooks
- `register-user` -- Registrierung mit Email-Versand
- `send-auth-email` -- Auth-Email-Versand
- `sync-freemius-subscription` -- Abo-Synchronisation

### Datenbanktabellen (bleiben)
- `profiles` -- Benutzerprofile
- `user_credits` -- Premium-Status, Freemius-Daten
- `user_roles` -- Admin/Moderator-Rollen
- `deleted_accounts` -- GDPR-Loschprotokoll
- `registration_attempts` -- Rate-Limiting
- `pending_premium` -- Freemius Pending-Zuweisungen
- `processed_webhook_events` -- Webhook-Idempotenz

### Datenbankfunktionen (bleiben)
- `handle_user_email_confirmed` -- Trigger: Profil/Credits anlegen
- `update_updated_at_column` -- Trigger: updated_at aktualisieren
- `deactivate_expired_subscriptions` -- Cron: Abos deaktivieren
- `is_premium_user` -- Helper: Premium-Check
- `has_role` -- Helper: Rollen-Check
- `cleanup_old_deleted_accounts` -- Cron: GDPR Cleanup
- `cleanup_unconfirmed_users` -- Cron: Unbestaetigt loschen
- `cleanup_old_processed_events` -- Cron: Webhook-Events aufraumen

---

## Was entfernt wird

### 1. Frontend -- Seiten loschen
| Datei | Grund |
|---|---|
| `src/pages/Dashboard.tsx` | Validation-Analytics |
| `src/pages/ValidationPlatform.tsx` | Kern-Feature (Multi-AI Validation) |
| `src/pages/Teams.tsx` | Team-Workspaces |
| `src/pages/TeamMembers.tsx` | Team-Mitglieder |
| `src/pages/TeamSettings.tsx` | Team-Einstellungen |
| `src/pages/TeamInvite.tsx` | Team-Einladungen |

### 2. Frontend -- Komponenten-Ordner loschen
| Ordner | Inhalt |
|---|---|
| `src/components/dashboard/` | 5 Dateien (ConfidenceTrend, ConsensusDissentRatio, InsightsPanel, ModelPerformance, StatsOverview) |
| `src/components/experiment/` | 7 Dateien (ActionCard, DecisionEvidenceLog, ExperimentSetupDialog, ExperimentWorkflow, GoNoGoDecision, Scorecard, StartExperimentButton) |
| `src/components/validation/` | 16+ Dateien (ValidationInput, ValidationOutput, ModelSelector, PDFExportButton, etc.) |
| `src/components/team/` | 3 Dateien (CreateTeamDialog, PremiumUpgradeDialog, TeamSwitcher) |
| `src/components/ReportPDF.tsx` | PDF-Report-Generierung |

### 3. Frontend -- Hooks loschen
| Datei | Grund |
|---|---|
| `src/hooks/useMultiAIValidation.ts` | Multi-AI Validation Logic |
| `src/hooks/useDashboardStats.ts` | Dashboard-Statistiken |
| `src/hooks/useExperiment.ts` | Experiment-Workflow |
| `src/hooks/useBusinessContext.ts` | Business-Kontext Profil |
| `src/hooks/useUserRole.ts` | User-Rollen (kann spaeter wieder eingefugt werden) |
| `src/hooks/useScrollReveal.ts` | Scroll-Animation (Feature-spezifisch) |

### 4. Frontend -- Home-Komponenten loschen
Alle Komponenten in `src/components/home/` werden entfernt, da sie sich auf die alte Validation-Funktionalitat beziehen:
- `Hero.tsx`, `Features.tsx`, `FeatureShowcase.tsx`, `ProcessTimeline.tsx`
- `PainPoints.tsx`, `FAQ.tsx`, `CTA.tsx`, `Testimonials.tsx`
- `HowItWorks.tsx`, `WhySynoptas.tsx`, `DecisionFlowAnimation.tsx`
- `Pricing.tsx` (Home-Version), `SectionDivider.tsx`, `TrustSection.tsx`

### 5. Frontend -- Contexts loschen
| Datei | Grund |
|---|---|
| `src/contexts/TeamContext.tsx` | Team-Workspace Logik |

### 6. Edge Functions loschen
| Funktion | Grund |
|---|---|
| `supabase/functions/multi-ai-query/` | Multi-AI Abfrage-Logik |
| `supabase/functions/meta-evaluation/` | Semantische Clustering-Logik |
| `supabase/functions/team-management/` | Team CRUD-Operationen |

### 7. Datenbanktabellen loschen (Migration)
| Tabelle | Grund |
|---|---|
| `validation_analyses` | Validierungs-Ergebnisse |
| `decision_records` | Entscheidungs-Protokolle |
| `decision_audit_log` | Audit-Log (FK zu decision_records) |
| `experiments` | Experiment-Workflows |
| `experiment_tasks` | Experiment-Aufgaben (FK zu experiments) |
| `experiment_checkpoints` | Experiment-Checkpoints (FK zu experiments) |
| `experiment_evidence` | Experiment-Evidenz (FK zu experiments) |
| `teams` | Team-Workspaces |
| `team_members` | Team-Mitglieder (FK zu teams) |
| `team_invitations` | Team-Einladungen (FK zu teams) |

### 8. Datenbankfunktionen loschen
| Funktion | Grund |
|---|---|
| `get_user_dashboard_stats` | Dashboard-Statistiken |
| `check_and_update_analysis_limit` | Validierungs-Limit |
| `increment_validation_count` | Validierungs-Zahler |
| `get_remaining_comments` | Kommentar-Limit |
| `check_comment_limit` | Kommentar-Rate-Limiting |
| `get_next_comment_time` | Kommentar-Zeitfenster |
| `log_decision_action` | Decision Audit Logging |
| `is_team_admin` | Team-Admin Check |
| `is_team_member` | Team-Member Check |
| `is_team_owner` | Team-Owner Check |
| `get_owned_teams` | Owned-Teams Abfrage |
| `cleanup_expired_invitations` | Team-Invitation Cleanup |

### 9. user_credits Tabelle bereinigen
Spalten entfernen, die nur fur Validierung relevant waren:
- `validation_count`
- `validation_window_start`
- `last_reset_date`
- `comment_count` (falls vorhanden)
- `comment_window_start` (falls vorhanden)
- `analysis_count` (falls vorhanden)
- `analysis_window_start` (falls vorhanden)
- `last_analysis_at` (falls vorhanden)
- `last_password_reset_at` bleibt (Auth-Infrastruktur)

### 10. Secrets loschen
| Secret | Grund |
|---|---|
| `CLAUDE_API_KEY` | Wurde fur Multi-AI verwendet |

Secrets die **bleiben**:
- `FREEMIUS_API_KEY`, `FREEMIUS_PUBLIC_KEY`, `FREEMIUS_SECRET_KEY`, `FREEMIUS_PRODUCT_ID` -- Zahlungsintegration
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `SUPABASE_PUBLISHABLE_KEY` -- Datenbankzugriff
- `LOVABLE_API_KEY` -- Lovable-Integration

---

## Anpassungen an bestehenden Dateien

### `src/App.tsx`
- Entferne alle Lazy-Imports fur geloschte Seiten (Dashboard, ValidationPlatform, Teams, TeamMembers, TeamSettings, TeamInvite)
- Entferne alle zugehorigen Routes
- Entferne `TeamProvider` Wrapper (TeamContext wird geloscht)

### `src/components/Navbar.tsx`
- Entferne Links zu Dashboard, Validate/Features, Teams/Workspaces
- Entferne `TeamSwitcher` Import und Nutzung
- Vereinfache Navigation auf: Home, Pricing, Contact

### `src/pages/Home.tsx`
- Entferne alle Home-Komponenten-Imports (Hero, ProcessTimeline, etc.)
- Erstelle eine einfache Platzhalter-Homepage mit Titel und CTA zum Login

### `src/pages/Profile.tsx`
- Entferne `useTeam` Import und Team-Sektion
- Entferne Team-Ownership-Warnung bei Account-Loschung
- Behalte: Email-Anzeige, Premium-Status, Sign Out, Delete Account

### `src/pages/Pricing.tsx`
- Entferne Feature-Vergleichstabelle mit alten Features
- Erstelle generische Premium-Seite mit Freemius Checkout

### `src/components/home/Pricing.tsx` (wird geloscht)
- Die Pricing-Seite (`src/pages/Pricing.tsx`) braucht eigene Pricing-Darstellung

### `src/lib/constants.ts`
- Entferne `TEAM_LIMITS` und `VALIDATION_LIMITS`

### `src/pages/AuthCallback.tsx`
- Prufen ob Team-Invite-Redirect-Logik entfernt werden muss

---

## Reihenfolge der Umsetzung

1. **Datenbank-Migration**: Tabellen, Funktionen und RLS-Policies in korrekter Reihenfolge loschen (Children-first wegen Foreign Keys)
2. **Edge Functions loschen**: `multi-ai-query`, `meta-evaluation`, `team-management` entfernen und deployed Functions loschen
3. **Frontend aufraumen**: Seiten, Komponenten, Hooks und Contexts loschen
4. **Bestehende Dateien anpassen**: App.tsx, Navbar, Home, Profile, Pricing, constants.ts
5. **Neue Platzhalter erstellen**: Einfache Home-Page und Pricing-Seite als Ausgangspunkt fur neue Features
6. **Secret loschen**: `CLAUDE_API_KEY` entfernen (wird nicht mehr benotigt)

---

## Technische Details

### Datenbank-Migration SQL (Reihenfolge beachten)
Die Tabellen mussen in dieser Reihenfolge geloscht werden, um Foreign-Key-Konflikte zu vermeiden:

```text
1. decision_audit_log (FK -> decision_records)
2. decision_records (FK -> validation_analyses)
3. experiment_tasks (FK -> experiments)
4. experiment_checkpoints (FK -> experiments)
5. experiment_evidence (FK -> experiments)
6. experiments (FK -> validation_analyses)
7. validation_analyses
8. team_invitations (FK -> teams)
9. team_members (FK -> teams)
10. teams
```

Danach: Datenbankfunktionen loschen und `user_credits` Spalten bereinigen.

### Erwartetes Ergebnis
Nach der Umsetzung hat die App:
- Funktionierende Registrierung/Login (Email + Google OAuth)
- Profil-Seite mit Premium-Status und Account-Loschung
- Freemius-Zahlungsintegration (Webhooks, Checkout, Sync)
- GDPR-konforme Datenloschung
- Cron-Jobs fur Bereinigung
- Leere Home-Page und Pricing als Ausgangspunkt fur neue Features
- Kontakt, Impressum, Datenschutz, AGB weiterhin verfugbar
