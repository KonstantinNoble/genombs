-- Create the validation_analyses table for Multi-AI Validation Platform
CREATE TABLE public.validation_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Input
  prompt TEXT NOT NULL,
  risk_preference INTEGER DEFAULT 3 CHECK (risk_preference >= 1 AND risk_preference <= 5),
  creativity_preference INTEGER DEFAULT 3 CHECK (creativity_preference >= 1 AND creativity_preference <= 5),
  
  -- Raw model responses (JSONB)
  gpt_response JSONB,
  gemini_pro_response JSONB,
  gemini_flash_response JSONB,
  
  -- Meta-analysis results
  consensus_points JSONB,
  majority_points JSONB,
  dissent_points JSONB,
  final_recommendation JSONB,
  overall_confidence INTEGER CHECK (overall_confidence >= 0 AND overall_confidence <= 100),
  
  -- Metadata
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.validation_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own validation analyses"
  ON public.validation_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own validation analyses"
  ON public.validation_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own validation analyses"
  ON public.validation_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_validation_analyses_user_id ON public.validation_analyses(user_id);
CREATE INDEX idx_validation_analyses_created_at ON public.validation_analyses(created_at DESC);

-- Add validation counters to user_credits table
ALTER TABLE public.user_credits
ADD COLUMN IF NOT EXISTS validation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS validation_window_start TIMESTAMPTZ;