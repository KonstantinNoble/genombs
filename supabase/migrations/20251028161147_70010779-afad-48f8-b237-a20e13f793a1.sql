-- Create business_ideas_history table
CREATE TABLE public.business_ideas_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  industry TEXT NOT NULL,
  team_size TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  business_context TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_ideas_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_ideas_history
CREATE POLICY "Users can view their own business ideas history"
ON public.business_ideas_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business ideas history"
ON public.business_ideas_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business ideas history"
ON public.business_ideas_history
FOR DELETE
USING (auth.uid() = user_id);