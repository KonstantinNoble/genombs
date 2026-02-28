-- ============================================================
-- Enforce single active backlink per user at the database level
-- ============================================================

-- 1) Partial unique index: guarantees at most 1 published profile per user_id.
--    Only rows where is_public = true are included, so unpublished rows are unaffected.
--    If a user somehow ends up with 2+ published profiles, clean them up first.

-- Clean up any existing duplicates (keep the most recently published one)
DO $$
DECLARE
  _user_id uuid;
BEGIN
  FOR _user_id IN
    SELECT user_id FROM website_profiles
    WHERE is_public = true
    GROUP BY user_id
    HAVING COUNT(*) > 1
  LOOP
    -- Keep only the latest published profile per user
    UPDATE website_profiles
    SET is_public = false
    WHERE user_id = _user_id
      AND is_public = true
      AND id NOT IN (
        SELECT id FROM website_profiles
        WHERE user_id = _user_id AND is_public = true
        ORDER BY published_at DESC NULLS LAST
        LIMIT 1
      );
  END LOOP;
END
$$;

-- Create the partial unique index (enforces 1 active backlink per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_backlink_per_user
  ON website_profiles (user_id)
  WHERE is_public = true;

-- 2) RLS policy: prevent non-premium users from publishing via direct client calls.
--    The Edge Function uses service_role so this doesn't block it, but it protects
--    against anyone calling the anon client directly.

-- Drop existing UPDATE policy if any (safe no-op if not exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'website_profiles'
      AND policyname = 'Users can update own profiles'
  ) THEN
    DROP POLICY "Users can update own profiles" ON website_profiles;
  END IF;
END
$$;

-- Recreate UPDATE policy: users can update their own profiles, but cannot set
-- is_public = true directly (must go through the publish-score Edge Function).
CREATE POLICY "Users can update own profiles"
  ON website_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Allow updates that do NOT try to set is_public = true
      is_public IS NOT TRUE
      -- OR the profile was already public (allow toggling other fields)
      OR (SELECT wp.is_public FROM website_profiles wp WHERE wp.id = id)
    )
  );

-- 3) RLS policy for publish_usage: users can only insert their own usage records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'publish_usage'
      AND policyname = 'Users can insert own publish usage'
  ) THEN
    CREATE POLICY "Users can insert own publish usage"
      ON publish_usage
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Users can read their own publish_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'publish_usage'
      AND policyname = 'Users can read own publish usage'
  ) THEN
    CREATE POLICY "Users can read own publish usage"
      ON publish_usage
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;
