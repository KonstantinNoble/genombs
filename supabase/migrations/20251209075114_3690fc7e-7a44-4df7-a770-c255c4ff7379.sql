
-- Create active_strategies table
CREATE TABLE public.active_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  original_result JSONB NOT NULL,
  is_deep_mode BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  total_phases INTEGER NOT NULL DEFAULT 0,
  completed_phases INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  completed_actions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create strategy_phase_progress table
CREATE TABLE public.strategy_phase_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.active_strategies(id) ON DELETE CASCADE,
  phase_index INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strategy_id, phase_index)
);

-- Create strategy_action_progress table
CREATE TABLE public.strategy_action_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.active_strategies(id) ON DELETE CASCADE,
  phase_index INTEGER NOT NULL,
  action_index INTEGER NOT NULL,
  action_text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strategy_id, phase_index, action_index)
);

-- Create strategy_milestone_progress table (for Deep Mode)
CREATE TABLE public.strategy_milestone_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID NOT NULL REFERENCES public.active_strategies(id) ON DELETE CASCADE,
  phase_index INTEGER NOT NULL,
  milestone_text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(strategy_id, phase_index, milestone_text)
);

-- Enable RLS on all tables
ALTER TABLE public.active_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_phase_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_action_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_milestone_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for active_strategies
CREATE POLICY "Users can view their own strategies"
ON public.active_strategies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategies"
ON public.active_strategies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies"
ON public.active_strategies FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies"
ON public.active_strategies FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for strategy_phase_progress (via strategy ownership)
CREATE POLICY "Users can view their strategy phases"
ON public.strategy_phase_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their strategy phases"
ON public.strategy_phase_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their strategy phases"
ON public.strategy_phase_progress FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete their strategy phases"
ON public.strategy_phase_progress FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

-- RLS Policies for strategy_action_progress
CREATE POLICY "Users can view their strategy actions"
ON public.strategy_action_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their strategy actions"
ON public.strategy_action_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their strategy actions"
ON public.strategy_action_progress FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete their strategy actions"
ON public.strategy_action_progress FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

-- RLS Policies for strategy_milestone_progress
CREATE POLICY "Users can view their strategy milestones"
ON public.strategy_milestone_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can insert their strategy milestones"
ON public.strategy_milestone_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their strategy milestones"
ON public.strategy_milestone_progress FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete their strategy milestones"
ON public.strategy_milestone_progress FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.active_strategies
  WHERE id = strategy_id AND user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_active_strategies_updated_at
BEFORE UPDATE ON public.active_strategies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_phase_progress_updated_at
BEFORE UPDATE ON public.strategy_phase_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
