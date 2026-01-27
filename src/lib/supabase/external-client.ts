/**
 * External Supabase Client
 *
 * This client connects directly to the external Supabase project (fhzqngbbvwpfdmhjfnvk)
 * instead of the auto-managed Lovable Cloud instance.
 *
 * The anon key is a publishable key and safe to include in client-side code.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// External Supabase project credentials
// These override the auto-managed .env values from Lovable Cloud
const EXTERNAL_SUPABASE_URL = "https://fhzqngbbvwpfdmhjfnvk.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoenFuZ2JidndwZmRtaGpmbnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MjIwNDEsImV4cCI6MjA4NTA5ODA0MX0.hWhaS9Sccw82F8oc2I27-AwIb6MpgxT_8ibiioUjGlo";

// Export the URL for edge function calls
export const SUPABASE_URL = EXTERNAL_SUPABASE_URL;
export const SUPABASE_PROJECT_ID = "fhzqngbbvwpfdmhjfnvk";

// Create and export the external Supabase client
export const supabase = createClient<Database>(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
