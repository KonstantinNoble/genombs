-- Create ads_advisor_history table
CREATE TABLE public.ads_advisor_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  campaign_type text NOT NULL,
  budget_range text NOT NULL,
  target_audience text NOT NULL,
  campaign_goals text NOT NULL,
  analysis_mode text DEFAULT 'standard',
  product_description text,
  competitor_info text,
  current_channels text,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads_advisor_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ads history"
  ON public.ads_advisor_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads history"
  ON public.ads_advisor_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads history"
  ON public.ads_advisor_history FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_ads_advisor_user_created 
  ON public.ads_advisor_history(user_id, created_at DESC);