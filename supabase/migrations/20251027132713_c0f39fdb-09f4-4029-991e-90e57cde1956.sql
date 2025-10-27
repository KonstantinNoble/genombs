-- Create table for business tools advisor history
CREATE TABLE public.business_tools_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  industry TEXT NOT NULL,
  team_size TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  business_goals TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.business_tools_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own business tools history" 
ON public.business_tools_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business tools history" 
ON public.business_tools_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business tools history" 
ON public.business_tools_history 
FOR DELETE 
USING (auth.uid() = user_id);