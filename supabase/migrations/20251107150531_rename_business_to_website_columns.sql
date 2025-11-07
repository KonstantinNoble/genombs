/*
  # Rename Business Columns to Website Columns

  This migration updates the column names in business_tools_history and business_ideas_history tables
  to reflect the new website-focused terminology.

  ## Changes to business_tools_history table
  - Rename `industry` to `website_type`
  - Rename `team_size` to `website_size`
  - Rename `business_goals` to `website_goals`

  ## Changes to business_ideas_history table
  - Rename `industry` to `website_type`
  - Rename `team_size` to `website_size`
  - Rename `business_context` to `website_context`

  ## Notes
  - Existing data is preserved during column renames
  - RLS policies remain unchanged as they reference user_id
  - No data loss occurs during this migration
*/

-- Rename columns in business_tools_history table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'industry'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN industry TO website_type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN team_size TO website_size;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'business_goals'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN business_goals TO website_goals;
  END IF;
END $$;

-- Rename columns in business_ideas_history table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'industry'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN industry TO website_type;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN team_size TO website_size;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'business_context'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN business_context TO website_context;
  END IF;
END $$;