
-- Add GitHub repo URL and code analysis columns to website_profiles
ALTER TABLE public.website_profiles
  ADD COLUMN github_repo_url text DEFAULT NULL,
  ADD COLUMN code_analysis jsonb DEFAULT NULL;

-- Add GitHub repo URL to analysis_queue
ALTER TABLE public.analysis_queue
  ADD COLUMN github_repo_url text DEFAULT NULL;
