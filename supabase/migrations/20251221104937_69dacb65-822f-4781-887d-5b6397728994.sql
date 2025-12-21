-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_business_ideas_created_at ON public.business_ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_idea_ratings_idea_id ON public.idea_ratings(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_ratings_user_id ON public.idea_ratings(user_id);

-- Create a view for aggregated idea stats
CREATE OR REPLACE VIEW public.ideas_with_stats AS
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