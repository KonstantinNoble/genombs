/*
  # Create Website Tools History Table

  1. New Tables
    - `website_tools_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `website_type` (text) - Type of website (e.g., blog, portfolio, ecommerce)
      - `current_stage` (text) - Current development stage
      - `budget_range` (text) - Budget range for tools/services
      - `website_goals` (text) - Website goals and objectives
      - `result` (jsonb) - AI recommendations result
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `website_tools_history` table
    - Add policy for users to read their own history
    - Add policy for users to insert their own history
    - Add policy for users to delete their own history

  3. Indexes
    - Index on `user_id` for efficient queries
    - Index on `created_at` for sorting
*/

CREATE TABLE IF NOT EXISTS website_tools_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_type text NOT NULL,
  current_stage text NOT NULL,
  budget_range text NOT NULL,
  website_goals text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE website_tools_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own website tools history"
  ON website_tools_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own website tools history"
  ON website_tools_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own website tools history"
  ON website_tools_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_website_tools_history_user_id 
  ON website_tools_history(user_id);

CREATE INDEX IF NOT EXISTS idx_website_tools_history_created_at 
  ON website_tools_history(created_at DESC);