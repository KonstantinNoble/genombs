-- Update ads_advisor_history table schema
ALTER TABLE public.ads_advisor_history 
  DROP COLUMN IF EXISTS campaign_goals,
  DROP COLUMN IF EXISTS current_channels,
  DROP COLUMN IF EXISTS competitor_info;

ALTER TABLE public.ads_advisor_history 
  ADD COLUMN IF NOT EXISTS product_details text;

-- Update character limits
ALTER TABLE public.ads_advisor_history 
  DROP CONSTRAINT IF EXISTS target_audience_length,
  DROP CONSTRAINT IF EXISTS product_description_length,
  DROP CONSTRAINT IF EXISTS product_details_length;

ALTER TABLE public.ads_advisor_history 
  ADD CONSTRAINT target_audience_length CHECK (char_length(target_audience) <= 100),
  ADD CONSTRAINT product_description_length CHECK (char_length(product_description) <= 100),
  ADD CONSTRAINT product_details_length CHECK (char_length(product_details) <= 100);