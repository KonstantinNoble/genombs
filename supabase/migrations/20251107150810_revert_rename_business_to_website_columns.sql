/*
  # Revert: Rename Website Columns back to Business Columns

  This migration reverts the column name changes back to the original business terminology.

  ## Changes to business_tools_history table
  - Rename `website_type` back to `industry`
  - Rename `website_size` back to `team_size`
  - Rename `website_goals` back to `business_goals`

  ## Changes to business_ideas_history table
  - Rename `website_type` back to `industry`
  - Rename `website_size` back to `team_size`
  - Rename `website_context` back to `business_context`

  ## Notes
  - Existing data is preserved during column renames
  - RLS policies remain unchanged as they reference user_id
  - No data loss occurs during this migration
*/

-- Revert columns in business_tools_history table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'website_type'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN website_type TO industry;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'website_size'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN website_size TO team_size;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_tools_history' AND column_name = 'website_goals'
  ) THEN
    ALTER TABLE public.business_tools_history RENAME COLUMN website_goals TO business_goals;
  END IF;
END $$;

-- Revert columns in business_ideas_history table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'website_type'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN website_type TO industry;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'website_size'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN website_size TO team_size;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_ideas_history' AND column_name = 'website_context'
  ) THEN
    ALTER TABLE public.business_ideas_history RENAME COLUMN website_context TO business_context;
  END IF;
END $$;