-- Create comments table with support for nested replies
CREATE TABLE public.idea_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.business_ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.idea_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.idea_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view comments" 
ON public.idea_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own comments" 
ON public.idea_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.idea_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.idea_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_idea_comments_idea_id ON public.idea_comments(idea_id);
CREATE INDEX idx_idea_comments_parent_id ON public.idea_comments(parent_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_idea_comments_updated_at
BEFORE UPDATE ON public.idea_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();