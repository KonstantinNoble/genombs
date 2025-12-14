-- Create autopilot_focus_tasks table
CREATE TABLE public.autopilot_focus_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES public.active_strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Task data
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT DEFAULT 'action',
  priority INTEGER DEFAULT 1,
  estimated_duration TEXT,
  
  -- Reference to original action (optional)
  phase_index INTEGER,
  action_index INTEGER,
  
  -- Status
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- AI context
  ai_reasoning TEXT,
  
  -- Timing
  generated_for_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_focus_tasks_strategy_date ON public.autopilot_focus_tasks(strategy_id, generated_for_date);
CREATE INDEX idx_focus_tasks_user_date ON public.autopilot_focus_tasks(user_id, generated_for_date);

-- Enable RLS
ALTER TABLE public.autopilot_focus_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own focus tasks" 
ON public.autopilot_focus_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus tasks" 
ON public.autopilot_focus_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus tasks" 
ON public.autopilot_focus_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus tasks" 
ON public.autopilot_focus_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Extend active_strategies table
ALTER TABLE public.active_strategies 
ADD COLUMN IF NOT EXISTS autopilot_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS autopilot_last_generated TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_focus_tasks_completed INTEGER DEFAULT 0;