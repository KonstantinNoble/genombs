// Re-export the external Supabase client so any legacy imports still work.
// The actual credentials live in @/lib/supabase/external-client.ts
export { supabase } from "@/lib/supabase/external-client";
