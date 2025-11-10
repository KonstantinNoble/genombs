-- Add screenshot_urls column to history tables
ALTER TABLE business_tools_history 
ADD COLUMN IF NOT EXISTS screenshot_urls text[] DEFAULT '{}';

ALTER TABLE business_ideas_history 
ADD COLUMN IF NOT EXISTS screenshot_urls text[] DEFAULT '{}';

-- Add separate tracking columns for tools and ideas in user_credits
ALTER TABLE user_credits
ADD COLUMN IF NOT EXISTS tools_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ideas_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS tools_window_start timestamp with time zone,
ADD COLUMN IF NOT EXISTS ideas_window_start timestamp with time zone;

-- Storage RLS policies for website-screenshots bucket
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'website-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);