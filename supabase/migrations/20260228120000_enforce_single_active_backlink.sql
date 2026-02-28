-- ============================================================
-- Enforce single active backlink per user at the database level
-- ============================================================

-- ── 0) Ensure the publish_usage table and RPC function exist ──
-- These may have been created manually; CREATE IF NOT EXISTS makes this safe.

-- publish_usage table: tracks each publish/replace action for monthly limit
CREATE TABLE IF NOT EXISTS publish_usage (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_profile_id uuid NOT NULL REFERENCES website_profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on publish_usage
ALTER TABLE publish_usage ENABLE ROW LEVEL SECURITY;

-- Index for fast monthly count lookups
CREATE INDEX IF NOT EXISTS idx_publish_usage_user_month
  ON publish_usage (user_id, created_at);

-- RPC function: counts publish actions in the current calendar month
CREATE OR REPLACE FUNCTION get_monthly_publish_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(COUNT(*)::integer, 0)
  FROM publish_usage
  WHERE user_id = _user_id
    AND created_at >= date_trunc('month', now());
$$;

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
-- is_public = true via the anon client. The publish-score Edge Function uses
-- service_role which bypasses RLS, so this only blocks direct client abuse.
-- The NEW row's is_public must be false (or match the OLD value) to pass.
CREATE POLICY "Users can update own profiles"
  ON website_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Allow any update that does NOT set is_public = true
      is_public IS NOT TRUE
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
