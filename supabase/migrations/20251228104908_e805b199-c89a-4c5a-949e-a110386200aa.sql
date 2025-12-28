-- Add market research columns to user_credits
ALTER TABLE public.user_credits 
ADD COLUMN IF NOT EXISTS market_research_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS market_research_window_start timestamp with time zone;

-- Create market research history table
CREATE TABLE IF NOT EXISTS public.market_research_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  industry text,
  analysis_options jsonb NOT NULL,
  result jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_research_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own market research history"
ON public.market_research_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own market research history"
ON public.market_research_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own market research history"
ON public.market_research_history
FOR DELETE
USING (auth.uid() = user_id);