-- Create experiments table
CREATE TABLE public.experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  validation_id UUID REFERENCES public.validation_analyses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  duration_days INTEGER NOT NULL CHECK (duration_days IN (7, 14, 30)),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  success_metrics JSONB NOT NULL DEFAULT '[]',
  final_review JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiment_tasks table
CREATE TABLE public.experiment_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create experiment_checkpoints table
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

-- Enable RLS on all tables
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_checkpoints ENABLE ROW LEVEL SECURITY;

-- RLS policies for experiments
CREATE POLICY "Users can view their own experiments"
ON public.experiments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiments"
ON public.experiments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiments"
ON public.experiments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiments"
ON public.experiments FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for experiment_tasks (via experiment ownership)
CREATE POLICY "Users can view tasks of their experiments"
ON public.experiment_tasks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_tasks.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can create tasks for their experiments"
ON public.experiment_tasks FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_tasks.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can update tasks of their experiments"
ON public.experiment_tasks FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_tasks.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can delete tasks of their experiments"
ON public.experiment_tasks FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_tasks.experiment_id
  AND experiments.user_id = auth.uid()
));

-- RLS policies for experiment_checkpoints (via experiment ownership)
CREATE POLICY "Users can view checkpoints of their experiments"
ON public.experiment_checkpoints FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_checkpoints.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can create checkpoints for their experiments"
ON public.experiment_checkpoints FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_checkpoints.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can update checkpoints of their experiments"
ON public.experiment_checkpoints FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_checkpoints.experiment_id
  AND experiments.user_id = auth.uid()
));

CREATE POLICY "Users can delete checkpoints of their experiments"
ON public.experiment_checkpoints FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.experiments
  WHERE experiments.id = experiment_checkpoints.experiment_id
  AND experiments.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX idx_experiments_status ON public.experiments(status);
CREATE INDEX idx_experiment_tasks_experiment_id ON public.experiment_tasks(experiment_id);
CREATE INDEX idx_experiment_checkpoints_experiment_id ON public.experiment_checkpoints(experiment_id);

-- Create updated_at trigger for experiments
CREATE TRIGGER update_experiments_updated_at
BEFORE UPDATE ON public.experiments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();