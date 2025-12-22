-- Remove the CHECK constraint for comment content length
ALTER TABLE public.idea_comments
DROP CONSTRAINT IF EXISTS idea_comments_content_length_check;