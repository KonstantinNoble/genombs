

# Datenbank-Migration für externes Supabase

## Übersicht

Ich habe alle 104 Migrations-Dateien analysiert und ein konsolidiertes SQL-Script erstellt, das den **finalen Zustand** der Datenbank repräsentiert. Viele der alten Migrations erstellen Tabellen, die später wieder gelöscht wurden, daher enthält das finale Script nur die **aktuell benötigten** Objekte.

---

## Option 1: SQL Editor (Empfohlen für Anfänger)

### Schritt-für-Schritt Anleitung:

1. **Öffne dein Supabase Dashboard**: https://supabase.com/dashboard/project/fhzqngbbvwpfdmhjfnvk
2. **Navigiere zu**: SQL Editor (linke Seitenleiste)
3. **Erstelle eine neue Query** (+ New Query)
4. **Kopiere das komplette SQL-Script** (siehe unten)
5. **Führe es aus** (Run Button oder Ctrl+Enter)

### Wichtig: Das Script muss in **3 Teilen** ausgeführt werden:

**Teil 1** erstellt die Basis-Objekte (Extensions, Types, Funktionen)
**Teil 2** erstellt alle Tabellen mit RLS
**Teil 3** erstellt die Foreign Keys, Trigger und Cron Jobs

---

## Teil 1: Extensions, Types und Basis-Funktionen

```sql
-- =============================================
-- TEIL 1: Extensions, Types und Basis-Funktionen
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enum Types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Basis-Funktion für updated_at Trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
```

---

## Teil 2: Tabellen mit RLS Policies

```sql
-- =============================================
-- TEIL 2: TABELLEN MIT RLS POLICIES
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 2. USER_CREDITS TABLE
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_since TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN DEFAULT NULL,
  last_password_reset_at TIMESTAMP WITH TIME ZONE,
  validation_count INTEGER DEFAULT 0,
  validation_window_start TIMESTAMP WITH TIME ZONE,
  freemius_subscription_id TEXT,
  freemius_customer_id TEXT
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credits" ON public.user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users cannot delete their own credits" ON public.user_credits FOR DELETE TO authenticated USING (false);

CREATE INDEX idx_user_credits_premium ON public.user_credits(is_premium);
CREATE INDEX idx_user_credits_freemius_sub ON public.user_credits(freemius_subscription_id) WHERE freemius_subscription_id IS NOT NULL;

-- 3. USER_ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. TEAMS TABLE
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_slug ON public.teams(slug);

-- 5. TEAM_MEMBERS TABLE
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- 6. TEAM_INVITATIONS TABLE
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, email)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);

-- 7. VALIDATION_ANALYSES TABLE
CREATE TABLE public.validation_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  risk_preference INTEGER DEFAULT 3 CHECK (risk_preference >= 1 AND risk_preference <= 5),
  creativity_preference INTEGER DEFAULT 3 CHECK (creativity_preference >= 1 AND creativity_preference <= 5),
  gpt_response JSONB,
  gemini_pro_response JSONB,
  gemini_flash_response JSONB,
  consensus_points JSONB,
  majority_points JSONB,
  dissent_points JSONB,
  final_recommendation JSONB,
  overall_confidence INTEGER CHECK (overall_confidence >= 0 AND overall_confidence <= 100),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  model_responses JSONB,
  selected_models TEXT[],
  model_weights JSONB,
  is_premium BOOLEAN DEFAULT false,
  strategic_alternatives JSONB,
  long_term_outlook JSONB,
  competitor_insights TEXT,
  citations JSONB,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE
);

ALTER TABLE public.validation_analyses ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_validation_analyses_user_id ON public.validation_analyses(user_id);
CREATE INDEX idx_validation_analyses_created_at ON public.validation_analyses(created_at DESC);
CREATE INDEX idx_validation_analyses_team_id ON public.validation_analyses(team_id);

-- 8. DECISION_RECORDS TABLE
CREATE TABLE public.decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  validation_id UUID REFERENCES public.validation_analyses(id) ON DELETE SET NULL,
  decision_title TEXT NOT NULL,
  decision_context TEXT NOT NULL,
  stakeholders TEXT[] DEFAULT '{}',
  budget_range TEXT,
  deadline TIMESTAMPTZ,
  user_confirmed_ownership BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'confirmed', 'archived')),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE
);

ALTER TABLE public.decision_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_decision_records_user_id ON public.decision_records(user_id);
CREATE INDEX idx_decision_records_status ON public.decision_records(status);
CREATE INDEX idx_decision_records_created_at ON public.decision_records(created_at DESC);
CREATE INDEX idx_decision_records_team_id ON public.decision_records(team_id);

-- 9. DECISION_AUDIT_LOG TABLE
CREATE TABLE public.decision_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decision_records(id) ON DELETE CASCADE,
  actor_id UUID,
  action TEXT NOT NULL CHECK (action IN ('created', 'confirmed', 'exported', 'viewed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.decision_audit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_decision_audit_log_decision_id ON public.decision_audit_log(decision_id);
CREATE INDEX idx_decision_audit_log_created_at ON public.decision_audit_log(created_at DESC);

-- 10. EXPERIMENTS TABLE
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  validation_id UUID,
  title TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 14, 30)),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  success_metrics JSONB NOT NULL DEFAULT '[]',
  final_review JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  decision_question TEXT,
  final_decision TEXT,
  decision_rationale TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX idx_experiments_status ON public.experiments(status);
CREATE INDEX idx_experiments_team_id ON public.experiments(team_id);

-- 11. EXPERIMENT_TASKS TABLE
CREATE TABLE public.experiment_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  outcome TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_experiment_tasks_experiment_id ON public.experiment_tasks(experiment_id);

-- 12. EXPERIMENT_CHECKPOINTS TABLE
CREATE TABLE public.experiment_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  metrics_data JSONB,
  reflection TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_checkpoints ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_experiment_checkpoints_experiment_id ON public.experiment_checkpoints(experiment_id);

-- 13. EXPERIMENT_EVIDENCE TABLE
CREATE TABLE public.experiment_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('positive', 'negative', 'neutral')),
  strength TEXT NOT NULL CHECK (strength IN ('weak', 'medium', 'strong')),
  note TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.experiment_evidence ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_experiment_evidence_experiment_id ON public.experiment_evidence(experiment_id);
CREATE INDEX idx_experiment_evidence_created_at ON public.experiment_evidence(created_at DESC);

-- 14. DELETED_ACCOUNTS TABLE
CREATE TABLE public.deleted_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash TEXT UNIQUE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT DEFAULT 'user_requested'
);

ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage deleted accounts" ON public.deleted_accounts FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX idx_deleted_accounts_email_hash ON public.deleted_accounts(email_hash);
CREATE INDEX idx_deleted_accounts_deleted_at ON public.deleted_accounts(deleted_at);

-- 15. PENDING_PREMIUM TABLE
CREATE TABLE public.pending_premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  freemius_customer_id text NOT NULL,
  freemius_subscription_id text NOT NULL,
  email text NOT NULL,
  is_premium boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  billing_cycle INTEGER DEFAULT 1,
  auto_renew BOOLEAN DEFAULT true,
  next_payment_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.pending_premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage pending premium" ON public.pending_premium FOR ALL USING (auth.role() = 'service_role'::text);

CREATE INDEX idx_pending_premium_email ON public.pending_premium(LOWER(email));
CREATE INDEX idx_pending_premium_customer ON public.pending_premium(freemius_customer_id);

-- 16. PROCESSED_WEBHOOK_EVENTS TABLE
CREATE TABLE public.processed_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.processed_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage processed events" ON public.processed_webhook_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_processed_events_date ON public.processed_webhook_events(processed_at);

-- 17. REGISTRATION_ATTEMPTS TABLE
CREATE TABLE public.registration_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_hash TEXT
);

ALTER TABLE public.registration_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block authenticated users from registration_attempts" ON public.registration_attempts FOR ALL TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Block anon users from registration_attempts" ON public.registration_attempts FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE INDEX idx_registration_attempts_ip_hash_time ON public.registration_attempts(ip_hash, attempted_at);
```

---

## Teil 3: Funktionen, RLS Policies, Foreign Keys, Trigger und Cron Jobs

```sql
-- =============================================
-- TEIL 3: FUNKTIONEN, RLS POLICIES, TRIGGER, CRON JOBS
-- =============================================

-- Helper Functions for Teams
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = _user_id AND team_id = _team_id)
$$;

CREATE OR REPLACE FUNCTION public.is_team_admin(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner', 'admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_premium_user(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_premium FROM public.user_credits WHERE user_id = _user_id), false)
$$;

CREATE OR REPLACE FUNCTION public.is_team_owner(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = _user_id AND team_id = _team_id AND role = 'owner')
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_owned_teams(_user_id UUID)
RETURNS TABLE(id UUID, name TEXT) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT t.id, t.name FROM public.teams t
  INNER JOIN public.team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = _user_id AND tm.role = 'owner'
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for teams
CREATE POLICY "Premium users can create teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (is_premium_user(auth.uid()) AND auth.uid() = owner_id);
CREATE POLICY "Team members can view teams" ON public.teams FOR SELECT TO authenticated USING (is_team_member(auth.uid(), id));
CREATE POLICY "Owner can update team" ON public.teams FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner can delete team" ON public.teams FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Team members can view members" ON public.team_members FOR SELECT TO authenticated USING (is_team_member(auth.uid(), team_id));
CREATE POLICY "Admins can insert members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (is_team_admin(auth.uid(), team_id) OR auth.uid() = user_id);
CREATE POLICY "Admins can update members" ON public.team_members FOR UPDATE TO authenticated USING (is_team_admin(auth.uid(), team_id));
CREATE POLICY "Admins or self can delete members" ON public.team_members FOR DELETE TO authenticated USING (is_team_admin(auth.uid(), team_id) OR auth.uid() = user_id);

-- RLS Policies for team_invitations
CREATE POLICY "Admins can view invitations" ON public.team_invitations FOR SELECT TO authenticated USING (is_team_admin(auth.uid(), team_id));
CREATE POLICY "Admins can create invitations" ON public.team_invitations FOR INSERT TO authenticated WITH CHECK (is_team_admin(auth.uid(), team_id));
CREATE POLICY "Admins can delete invitations" ON public.team_invitations FOR DELETE TO authenticated USING (is_team_admin(auth.uid(), team_id));

-- RLS Policies for validation_analyses
CREATE POLICY "Users can view own and team validations" ON public.validation_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id)));
CREATE POLICY "Users can insert own validation analyses" ON public.validation_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own validation analyses" ON public.validation_analyses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for decision_records
CREATE POLICY "Users can view own and team decisions" ON public.decision_records FOR SELECT TO authenticated USING (auth.uid() = user_id OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id)));
CREATE POLICY "Users can create own decision records" ON public.decision_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own decision records" ON public.decision_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own decision records" ON public.decision_records FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for decision_audit_log
CREATE POLICY "Users can view audit logs of own decisions" ON public.decision_audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.decision_records WHERE decision_records.id = decision_audit_log.decision_id AND decision_records.user_id = auth.uid()));
CREATE POLICY "Users can insert audit logs for own decisions" ON public.decision_audit_log FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.decision_records WHERE decision_records.id = decision_audit_log.decision_id AND decision_records.user_id = auth.uid()));

-- RLS Policies for experiments
CREATE POLICY "Users can view own and team experiments" ON public.experiments FOR SELECT TO authenticated USING (auth.uid() = user_id OR (team_id IS NOT NULL AND is_team_member(auth.uid(), team_id)));
CREATE POLICY "Users can create their own experiments" ON public.experiments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own experiments" ON public.experiments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own experiments" ON public.experiments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for experiment_tasks
CREATE POLICY "Users can view tasks of their experiments" ON public.experiment_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_tasks.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can create tasks for their experiments" ON public.experiment_tasks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_tasks.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can update tasks of their experiments" ON public.experiment_tasks FOR UPDATE USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_tasks.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can delete tasks of their experiments" ON public.experiment_tasks FOR DELETE USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_tasks.experiment_id AND experiments.user_id = auth.uid()));

-- RLS Policies for experiment_checkpoints
CREATE POLICY "Users can view checkpoints of their experiments" ON public.experiment_checkpoints FOR SELECT USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_checkpoints.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can create checkpoints for their experiments" ON public.experiment_checkpoints FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_checkpoints.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can update checkpoints of their experiments" ON public.experiment_checkpoints FOR UPDATE USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_checkpoints.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can delete checkpoints of their experiments" ON public.experiment_checkpoints FOR DELETE USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_checkpoints.experiment_id AND experiments.user_id = auth.uid()));

-- RLS Policies for experiment_evidence
CREATE POLICY "Users can view evidence of their experiments" ON public.experiment_evidence FOR SELECT USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_evidence.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can insert evidence for their experiments" ON public.experiment_evidence FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_evidence.experiment_id AND experiments.user_id = auth.uid()));
CREATE POLICY "Users can delete evidence of their experiments" ON public.experiment_evidence FOR DELETE USING (EXISTS (SELECT 1 FROM public.experiments WHERE experiments.id = experiment_evidence.experiment_id AND experiments.user_id = auth.uid()));

-- Foreign Key Constraints
ALTER TABLE public.validation_analyses ADD CONSTRAINT validation_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.experiments ADD CONSTRAINT experiments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.experiments ADD CONSTRAINT experiments_validation_id_fkey FOREIGN KEY (validation_id) REFERENCES public.validation_analyses(id) ON DELETE CASCADE;
ALTER TABLE public.decision_records ADD CONSTRAINT decision_records_user_id_auth_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Cleanup Functions
CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_accounts() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN DELETE FROM public.deleted_accounts WHERE deleted_at < NOW() - INTERVAL '24 hours'; END; $$;

CREATE OR REPLACE FUNCTION public.cleanup_old_processed_events() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN DELETE FROM public.processed_webhook_events WHERE processed_at < NOW() - INTERVAL '30 days'; END; $$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN DELETE FROM public.team_invitations WHERE expires_at < NOW(); END; $$;

-- Dashboard Stats Function
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id uuid) RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE result JSON; v_validation_stats JSON; v_decision_stats JSON; v_model_usage JSON; v_confidence_trend JSON;
BEGIN
  SELECT json_build_object('total_validations', COUNT(*), 'avg_confidence', COALESCE(ROUND(AVG(overall_confidence)::numeric, 1), 0), 'high_confidence_count', COUNT(*) FILTER (WHERE overall_confidence >= 75), 'medium_confidence_count', COUNT(*) FILTER (WHERE overall_confidence BETWEEN 50 AND 74), 'low_confidence_count', COUNT(*) FILTER (WHERE overall_confidence < 50), 'first_validation', MIN(created_at), 'last_validation', MAX(created_at), 'active_days', COUNT(DISTINCT DATE(created_at)), 'consensus_rate', COALESCE(ROUND((COUNT(*) FILTER (WHERE (consensus_points IS NOT NULL AND jsonb_array_length(consensus_points) > 0) OR (majority_points IS NOT NULL AND jsonb_array_length(majority_points) > 0))::numeric / NULLIF(COUNT(*), 0) * 100), 0), 0)) INTO v_validation_stats FROM validation_analyses WHERE user_id = p_user_id;
  SELECT json_build_object('total_decisions', COUNT(*), 'confirmed_decisions', COUNT(*) FILTER (WHERE user_confirmed_ownership = true), 'draft_count', COUNT(*) FILTER (WHERE status = 'draft'), 'confirmed_count', COUNT(*) FILTER (WHERE status = 'confirmed'), 'total_exports', COALESCE(SUM(export_count), 0)) INTO v_decision_stats FROM decision_records WHERE user_id = p_user_id;
  SELECT json_build_object('gptMini', COUNT(*) FILTER (WHERE 'gptMini' = ANY(selected_models)), 'geminiPro', COUNT(*) FILTER (WHERE 'geminiPro' = ANY(selected_models)), 'geminiFlash', COUNT(*) FILTER (WHERE 'geminiFlash' = ANY(selected_models)), 'perplexity', COUNT(*) FILTER (WHERE 'perplexity' = ANY(selected_models)), 'claude', COUNT(*) FILTER (WHERE 'claude' = ANY(selected_models)), 'sonarReasoning', COUNT(*) FILTER (WHERE 'sonarReasoning' = ANY(selected_models))) INTO v_model_usage FROM validation_analyses WHERE user_id = p_user_id;
  SELECT COALESCE(json_agg(trend ORDER BY trend.created_at ASC), '[]'::json) INTO v_confidence_trend FROM (SELECT created_at, overall_confidence as confidence, DATE(created_at) as date FROM validation_analyses WHERE user_id = p_user_id ORDER BY created_at DESC LIMIT 30) trend;
  result := json_build_object('validation_stats', v_validation_stats, 'decision_stats', v_decision_stats, 'model_usage', v_model_usage, 'confidence_trend', v_confidence_trend);
  RETURN result;
END; $function$;

-- Log Decision Action Function
CREATE OR REPLACE FUNCTION public.log_decision_action(p_decision_id UUID, p_action TEXT, p_metadata JSONB DEFAULT '{}') RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_log_id UUID;
BEGIN INSERT INTO public.decision_audit_log (decision_id, actor_id, action, metadata) VALUES (p_decision_id, auth.uid(), p_action, p_metadata) RETURNING id INTO v_log_id; RETURN v_log_id; END; $$;

-- Increment Validation Count Function
CREATE OR REPLACE FUNCTION public.increment_validation_count(user_uuid UUID, reset_window BOOLEAN DEFAULT FALSE) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF reset_window THEN UPDATE public.user_credits SET validation_count = 1, validation_window_start = NOW(), updated_at = NOW() WHERE user_id = user_uuid;
  ELSE UPDATE public.user_credits SET validation_count = COALESCE(validation_count, 0) + 1, updated_at = NOW() WHERE user_id = user_uuid; END IF;
END; $$;

-- Handle User Email Confirmed (Trigger Function)
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) OR (NEW.email_confirmed_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id)) THEN
    INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_credits (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$;

-- Triggers
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON public.user_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_experiments_updated_at BEFORE UPDATE ON public.experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER on_user_email_confirmed AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW WHEN (NEW.email_confirmed_at IS NOT NULL) EXECUTE FUNCTION public.handle_user_email_confirmed();

-- Cron Jobs
SELECT cron.schedule('cleanup-deleted-accounts-hourly', '0 * * * *', 'SELECT public.cleanup_old_deleted_accounts();');
SELECT cron.schedule('cleanup-registration-attempts', '0 * * * *', $$ UPDATE public.registration_attempts SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND attempted_at < NOW() - INTERVAL '2 hours'; DELETE FROM public.registration_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours'; $$);

-- Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('website-screenshots', 'website-screenshots', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload their own screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'website-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'website-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'website-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Option 2: Supabase CLI (Empfohlen für Entwickler)

### Voraussetzungen:
- Node.js installiert
- Supabase CLI: `npm install -g supabase`

### Schritt-für-Schritt:

```bash
# 1. Im Projektverzeichnis öffnen
cd /pfad/zu/deinem/projekt

# 2. Mit externem Supabase verbinden
supabase link --project-ref fhzqngbbvwpfdmhjfnvk

# 3. Migrations auf externes Supabase pushen
supabase db push

# 4. Secrets setzen (WICHTIG!)
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set GOOGLE_AI_API_KEY=xxx
supabase secrets set CLAUDE_API_KEY=xxx
supabase secrets set PERPLEXITY_API_KEY=xxx
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set FREEMIUS_API_KEY=xxx
supabase secrets set FREEMIUS_SECRET_KEY=xxx
supabase secrets set FREEMIUS_PUBLIC_KEY=xxx
supabase secrets set FREEMIUS_PRODUCT_ID=xxx
supabase secrets set FIRECRAWL_API_KEY=xxx

# 5. Edge Functions deployen
supabase functions deploy
```

---

## Zusammenfassung der Tabellen (17 Stück)

| Tabelle | Beschreibung |
|---------|--------------|
| profiles | User-Profile |
| user_credits | Premium-Status, Credits, Limits |
| user_roles | Admin/Moderator Rollen |
| teams | Team-Organisationen |
| team_members | Team-Mitgliedschaften |
| team_invitations | Einladungen zu Teams |
| validation_analyses | Multi-AI Validierungen |
| decision_records | Entscheidungsdokumente |
| decision_audit_log | Audit-Trail für Entscheidungen |
| experiments | Experimente |
| experiment_tasks | Aufgaben in Experimenten |
| experiment_checkpoints | Checkpoints in Experimenten |
| experiment_evidence | Beweise in Experimenten |
| deleted_accounts | DSGVO-konforme Löschprotokolle |
| pending_premium | Premium vor Registrierung |
| processed_webhook_events | Webhook-Replay-Schutz |
| registration_attempts | Rate-Limiting für Registrierung |

