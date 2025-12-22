-- Add CHECK constraint to limit comment content to 2000 characters
ALTER TABLE public.idea_comments
ADD CONSTRAINT idea_comments_content_length_check 
CHECK (char_length(content) <= 2000);