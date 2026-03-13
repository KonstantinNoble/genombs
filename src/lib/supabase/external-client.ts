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

// External Supabase project credentials from .env
const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

// Export the URL and anon key for edge function calls
export const SUPABASE_URL = EXTERNAL_SUPABASE_URL;
export const SUPABASE_ANON_KEY = EXTERNAL_SUPABASE_ANON_KEY;
export const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || "";

// Create and export the external Supabase client
export const supabase = createClient<Database>(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
