-- ===========================================
-- PHASE 2: Decision Records & Audit Trail
-- ===========================================

-- Create decision_records table
CREATE TABLE public.decision_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  validation_id UUID REFERENCES public.validation_analyses(id) ON DELETE SET NULL,
  
  -- Decision Context (structured input)
  decision_title TEXT NOT NULL,
  decision_context TEXT NOT NULL,
  stakeholders TEXT[] DEFAULT '{}',
  budget_range TEXT,
  deadline TIMESTAMPTZ,
  
  -- User Confirmation (legally important!)
  user_confirmed_ownership BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  
  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'confirmed', 'archived'))
);

-- Create decision_audit_log table (immutable audit trail)
CREATE TABLE public.decision_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL REFERENCES public.decision_records(id) ON DELETE CASCADE,
  actor_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Action type
  action TEXT NOT NULL CHECK (action IN ('created', 'confirmed', 'exported', 'viewed', 'archived'))
);

-- Create indexes for performance
CREATE INDEX idx_decision_records_user_id ON public.decision_records(user_id);
CREATE INDEX idx_decision_records_status ON public.decision_records(status);
CREATE INDEX idx_decision_records_created_at ON public.decision_records(created_at DESC);
CREATE INDEX idx_decision_audit_log_decision_id ON public.decision_audit_log(decision_id);
CREATE INDEX idx_decision_audit_log_created_at ON public.decision_audit_log(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.decision_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_audit_log ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS Policies for decision_records
-- ===========================================

-- Users can view their own decision records
CREATE POLICY "Users can view own decision records"
ON public.decision_records
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own decision records
CREATE POLICY "Users can create own decision records"
ON public.decision_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own decision records
CREATE POLICY "Users can update own decision records"
ON public.decision_records
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own decision records
CREATE POLICY "Users can delete own decision records"
ON public.decision_records
FOR DELETE
USING (auth.uid() = user_id);

-- ===========================================
-- RLS Policies for decision_audit_log
-- ===========================================

-- Users can view audit logs of their own decision records
CREATE POLICY "Users can view audit logs of own decisions"
ON public.decision_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.decision_records
    WHERE decision_records.id = decision_audit_log.decision_id
    AND decision_records.user_id = auth.uid()
  )
);

-- Users can insert audit logs for their own decision records
CREATE POLICY "Users can insert audit logs for own decisions"
ON public.decision_audit_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.decision_records
    WHERE decision_records.id = decision_audit_log.decision_id
    AND decision_records.user_id = auth.uid()
  )
);

-- Audit logs are immutable - no UPDATE or DELETE allowed for users
-- (Only service role can modify if needed)

-- ===========================================
-- Function to auto-create audit log entry
-- ===========================================

CREATE OR REPLACE FUNCTION public.log_decision_action(
  p_decision_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.decision_audit_log (decision_id, actor_id, action, metadata)
  VALUES (p_decision_id, auth.uid(), p_action, p_metadata)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;