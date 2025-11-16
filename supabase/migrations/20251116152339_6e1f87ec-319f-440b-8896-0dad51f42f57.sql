-- Create storage bucket for business analysis images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-analysis-images',
  'business-analysis-images',
  false,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- RLS Policy: Premium users can upload images
CREATE POLICY "Premium users can upload analysis images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-analysis-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.user_credits 
    WHERE user_id = auth.uid() AND is_premium = true
  )
);

-- RLS Policy: Users can read their own images
CREATE POLICY "Users can read own analysis images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'business-analysis-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can delete their own images
CREATE POLICY "Users can delete own analysis images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-analysis-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add column for image URL to business_ideas_history
ALTER TABLE business_ideas_history 
ADD COLUMN uploaded_image_url text;

-- Create index for faster queries
CREATE INDEX idx_business_ideas_history_image 
ON business_ideas_history(uploaded_image_url) 
WHERE uploaded_image_url IS NOT NULL;