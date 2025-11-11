-- Add mode-specific columns to user_credits table
ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS deep_analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deep_analysis_window_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS standard_analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS standard_analysis_window_start TIMESTAMP WITH TIME ZONE;

-- Add analysis_mode column to history tables
ALTER TABLE business_tools_history 
ADD COLUMN IF NOT EXISTS analysis_mode TEXT DEFAULT 'standard';

ALTER TABLE business_ideas_history 
ADD COLUMN IF NOT EXISTS analysis_mode TEXT DEFAULT 'standard';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tools_analysis_mode ON business_tools_history(user_id, analysis_mode, created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_analysis_mode ON business_ideas_history(user_id, analysis_mode, created_at);