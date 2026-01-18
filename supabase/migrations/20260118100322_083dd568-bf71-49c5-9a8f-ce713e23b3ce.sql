-- Create experiment_evidence table
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

-- Enable RLS
ALTER TABLE public.experiment_evidence ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view evidence of their experiments"
  ON public.experiment_evidence FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.experiments 
    WHERE experiments.id = experiment_evidence.experiment_id 
    AND experiments.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert evidence for their experiments"
  ON public.experiment_evidence FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.experiments 
    WHERE experiments.id = experiment_evidence.experiment_id 
    AND experiments.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete evidence of their experiments"
  ON public.experiment_evidence FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.experiments 
    WHERE experiments.id = experiment_evidence.experiment_id 
    AND experiments.user_id = auth.uid()
  ));

-- Critical Bug Fix: Add missing Foreign Key CASCADE for validation deletion
-- First drop the existing constraint if it exists (without CASCADE)
ALTER TABLE public.experiments 
  DROP CONSTRAINT IF EXISTS experiments_validation_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE public.experiments
  ADD CONSTRAINT experiments_validation_id_fkey
  FOREIGN KEY (validation_id) 
  REFERENCES public.validation_analyses(id) 
  ON DELETE CASCADE;

-- Index for faster lookups
CREATE INDEX idx_experiment_evidence_experiment_id ON public.experiment_evidence(experiment_id);
CREATE INDEX idx_experiment_evidence_created_at ON public.experiment_evidence(created_at DESC);