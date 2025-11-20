-- Update ads_advisor_history table to match new structure
ALTER TABLE public.ads_advisor_history
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS competitor_strategy TEXT,
  ADD COLUMN IF NOT EXISTS specific_requirements TEXT,
  ALTER COLUMN website_url DROP NOT NULL,
  ALTER COLUMN website_url SET DEFAULT '';

-- Update existing records to have empty website_url
UPDATE public.ads_advisor_history 
SET website_url = COALESCE(website_url, '');

-- Add comments for clarity
COMMENT ON COLUMN public.ads_advisor_history.industry IS 'Industry sector of the business';
COMMENT ON COLUMN public.ads_advisor_history.competitor_strategy IS 'Competitor advertising strategy level';
COMMENT ON COLUMN public.ads_advisor_history.specific_requirements IS 'Additional specific requirements (max 100 chars)';