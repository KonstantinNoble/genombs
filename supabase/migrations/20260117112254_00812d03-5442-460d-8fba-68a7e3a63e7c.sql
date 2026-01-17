-- Add decision-focused fields to experiments table
ALTER TABLE public.experiments 
ADD COLUMN IF NOT EXISTS decision_question TEXT,
ADD COLUMN IF NOT EXISTS final_decision TEXT,
ADD COLUMN IF NOT EXISTS decision_rationale TEXT;

-- Add outcome field to experiment_tasks for validation actions
ALTER TABLE public.experiment_tasks 
ADD COLUMN IF NOT EXISTS outcome TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.experiments.final_decision IS 'go or no_go';
COMMENT ON COLUMN public.experiment_tasks.outcome IS 'positive, negative, or neutral';