-- Add premium fields to validation_analyses table
ALTER TABLE public.validation_analyses 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS strategic_alternatives JSONB,
ADD COLUMN IF NOT EXISTS long_term_outlook JSONB,
ADD COLUMN IF NOT EXISTS competitor_insights TEXT,
ADD COLUMN IF NOT EXISTS citations JSONB;