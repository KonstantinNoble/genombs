-- Fix security definer view by setting security_invoker = true
-- This makes the view respect RLS policies of the querying user
DROP VIEW IF EXISTS public.ideas_with_stats;

CREATE VIEW public.ideas_with_stats 
WITH (security_invoker = true) AS
SELECT 
  bi.id,
  bi.user_id,
  bi.content,
  bi.website_url,
  bi.created_at,
  bi.updated_at,
  COALESCE(AVG(ir.rating)::numeric(3,2), 0) as average_rating,
  COUNT(ir.id)::integer as total_ratings
FROM public.business_ideas bi
LEFT JOIN public.idea_ratings ir ON ir.idea_id = bi.id
GROUP BY bi.id, bi.user_id, bi.content, bi.website_url, bi.created_at, bi.updated_at;