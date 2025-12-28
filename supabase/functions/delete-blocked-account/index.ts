import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("Configuration error");
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: getUserError } = await userClient.auth.getUser();
    if (getUserError || !userData?.user) {
      console.error("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    // Verify user is newly created (< 1 minute old for safety margin)
    const accountAge = new Date().getTime() - new Date(userData.user.created_at).getTime();
    if (accountAge > 60000) {
      console.error("Account too old to delete via this endpoint");
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Deleting blocked account for user ${userId}`);

    // Admin client to delete the user
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // GDPR-compliant: Delete ALL user data in correct order
    // Order matters: child tables first, then parent tables, finally auth user

    // 1. Get all strategy IDs for this user (needed for child table deletions)
    const { data: strategies } = await adminClient
      .from('active_strategies')
      .select('id')
      .eq('user_id', userId);

    const strategyIds = strategies?.map(s => s.id) || [];

    // 2. Delete autopilot_focus_tasks (references strategy_id)
    console.log('Deleting autopilot_focus_tasks for user:', userId);
    await adminClient
      .from('autopilot_focus_tasks')
      .delete()
      .eq('user_id', userId);

    // 3. Delete strategy_phase_progress (references strategy_id)
    if (strategyIds.length > 0) {
      console.log('Deleting strategy_phase_progress for strategies:', strategyIds);
      await adminClient
        .from('strategy_phase_progress')
        .delete()
        .in('strategy_id', strategyIds);
    }

    // 4. Delete active_strategies
    console.log('Deleting active_strategies for user:', userId);
    await adminClient
      .from('active_strategies')
      .delete()
      .eq('user_id', userId);

    // 5. Delete ads_advisor_history
    console.log('Deleting ads_advisor_history for user:', userId);
    await adminClient
      .from('ads_advisor_history')
      .delete()
      .eq('user_id', userId);

    // 6. Delete market_research_history
    console.log('Deleting market_research_history for user:', userId);
    await adminClient
      .from('market_research_history')
      .delete()
      .eq('user_id', userId);

    // 7. Delete business_tools_history
    console.log('Deleting business_tools_history for user:', userId);
    await adminClient
      .from('business_tools_history')
      .delete()
      .eq('user_id', userId);

    // 8. Delete user_roles
    console.log('Deleting user_roles for user:', userId);
    await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // 9. Delete user_credits
    console.log('Deleting user_credits for user:', userId);
    await adminClient
      .from('user_credits')
      .delete()
      .eq('user_id', userId);

    // 10. Delete profile
    console.log('Deleting profile for user:', userId);
    await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    // 11. Finally: Delete auth user
    console.log('Deleting auth user:', userId);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Deletion failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`✅ Successfully deleted blocked account: ${userEmail}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e) {
    console.error("Operation failed:", e);
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
