import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "conversationId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: verify user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user identity
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client for DB operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch existing profiles for this conversation (owned by user)
    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from("website_profiles")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    if (fetchError) {
      console.error("Failed to fetch profiles:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch profiles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let deletedTasks = 0;
    const deletedProfiles = profiles?.length ?? 0;

    if (profiles && profiles.length > 0) {
      const profileIds = profiles.map((p) => p.id);

      // 2. Delete improvement_tasks for these profiles
      const { error: taskDeleteError } = await supabaseAdmin
        .from("improvement_tasks")
        .delete()
        .in("website_profile_id", profileIds);

      if (taskDeleteError) {
        console.error("Failed to delete tasks:", taskDeleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete improvement tasks" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      deletedTasks = profileIds.length;
    }

    // 3. Delete website_profiles
    const { error: profileDeleteError } = await supabaseAdmin
      .from("website_profiles")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    if (profileDeleteError) {
      console.error("Failed to delete profiles:", profileDeleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete website profiles" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Verify deletion
    const { data: remaining } = await supabaseAdmin
      .from("website_profiles")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", user.id);

    if (remaining && remaining.length > 0) {
      console.error(`${remaining.length} profiles still exist after delete`);
      return new Response(
        JSON.stringify({ error: `${remaining.length} profiles could not be deleted` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleted ${deletedProfiles} profiles and ${deletedTasks} task groups for conversation ${conversationId}`);

    return new Response(
      JSON.stringify({ success: true, deletedProfiles, deletedTasks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("delete-profiles error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
