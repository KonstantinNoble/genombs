-- Add separate credit columns for Ads Advisor to user_credits table
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS ads_deep_analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_deep_analysis_window_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ads_standard_analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ads_standard_analysis_window_start TIMESTAMPTZ;

COMMENT ON COLUMN public.user_credits.ads_deep_analysis_count IS 'Deep analysis count for Ads Advisor (separate from website analysis)';
COMMENT ON COLUMN public.user_credits.ads_deep_analysis_window_start IS 'Window start for Ads Advisor deep analyses';
COMMENT ON COLUMN public.user_credits.ads_standard_analysis_count IS 'Standard analysis count for Ads Advisor (separate from website analysis)';
COMMENT ON COLUMN public.user_credits.ads_standard_analysis_window_start IS 'Window start for Ads Advisor standard analyses';

-- Create ads_advisor_history table
CREATE TABLE IF NOT EXISTS public.ads_advisor_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Input fields
  website_url TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  advertising_budget TEXT NOT NULL,
  advertising_goals TEXT NOT NULL,
  
  -- Premium/Deep mode fields
  current_channels TEXT,
  competitor_ads TEXT,
  geographic_target TEXT,
  
  -- Analysis result
  result JSONB NOT NULL,
  analysis_mode TEXT DEFAULT 'standard' CHECK (analysis_mode IN ('standard', 'deep')),
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ads_advisor_user_created 
  ON public.ads_advisor_history(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ads_advisor_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ads history" 
  ON public.ads_advisor_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ads history" 
  ON public.ads_advisor_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads history" 
  ON public.ads_advisor_history 
  FOR DELETE 
  USING (auth.uid() = user_id);