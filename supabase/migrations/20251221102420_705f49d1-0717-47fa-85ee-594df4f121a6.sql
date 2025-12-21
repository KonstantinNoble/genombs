-- Add display_name column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create business_ideas table
CREATE TABLE public.business_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create idea_ratings table
CREATE TABLE public.idea_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.business_ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(idea_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.business_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_ideas
CREATE POLICY "Anyone can view ideas" ON public.business_ideas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ideas" ON public.business_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" ON public.business_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" ON public.business_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for idea_ratings
CREATE POLICY "Anyone can view ratings" ON public.idea_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON public.idea_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.idea_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.idea_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Rate limiting function (2 posts per 24 hours)
CREATE OR REPLACE FUNCTION public.check_idea_post_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 2 FROM public.business_ideas
  WHERE user_id = p_user_id 
  AND created_at > NOW() - INTERVAL '24 hours'
$$;

-- Function to get remaining posts count
CREATE OR REPLACE FUNCTION public.get_remaining_idea_posts(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, 2 - COUNT(*)::INTEGER) FROM public.business_ideas
  WHERE user_id = p_user_id 
  AND created_at > NOW() - INTERVAL '24 hours'
$$;

-- Trigger to update updated_at on business_ideas
CREATE TRIGGER update_business_ideas_updated_at
  BEFORE UPDATE ON public.business_ideas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();