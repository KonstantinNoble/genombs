-- Create storage bucket for website screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-screenshots', 'website-screenshots', false);

-- RLS policies for website-screenshots bucket
CREATE POLICY "Users can upload their own screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'website-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'website-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own screenshots"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'website-screenshots'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add screenshot_urls column to business_tools_history table
ALTER TABLE public.business_tools_history
ADD COLUMN screenshot_urls text[] DEFAULT '{}';

-- Add screenshot_urls column to business_ideas_history table
ALTER TABLE public.business_ideas_history
ADD COLUMN screenshot_urls text[] DEFAULT '{}';