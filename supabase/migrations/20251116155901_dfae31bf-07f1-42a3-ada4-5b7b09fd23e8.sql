-- Remove image-related columns from business_ideas_history
ALTER TABLE public.business_ideas_history 
DROP COLUMN IF EXISTS screenshot_urls,
DROP COLUMN IF EXISTS uploaded_image_url;

-- Remove image-related column from business_tools_history
ALTER TABLE public.business_tools_history 
DROP COLUMN IF EXISTS screenshot_urls;

-- Delete the storage bucket for business analysis images
DELETE FROM storage.buckets WHERE id = 'business-analysis-images';