-- Add category column to business_ideas table
ALTER TABLE public.business_ideas 
ADD COLUMN category text;

-- Add check constraint for valid categories
ALTER TABLE public.business_ideas 
ADD CONSTRAINT valid_category CHECK (
  category IS NULL OR category IN (
    'SaaS', 
    'Mobile App', 
    'E-Commerce', 
    'Marketplace', 
    'AI/ML', 
    'FinTech', 
    'HealthTech', 
    'EdTech', 
    'Hardware', 
    'Service', 
    'Content', 
    'Other'
  )
);

-- Drop and recreate the ideas_with_stats view to include category
DROP VIEW IF EXISTS public.ideas_with_stats;

CREATE VIEW public.ideas_with_stats AS
SELECT 
  bi.id,
  bi.user_id,
  bi.content,
  bi.website_url,
  bi.category,
  bi.created_at,
  bi.updated_at,
  COALESCE(AVG(ir.rating)::numeric(3,2), 0) as average_rating,
  COUNT(ir.id)::integer as total_ratings
FROM public.business_ideas bi
LEFT JOIN public.idea_ratings ir ON bi.id = ir.idea_id
GROUP BY bi.id, bi.user_id, bi.content, bi.website_url, bi.category, bi.created_at, bi.updated_at;