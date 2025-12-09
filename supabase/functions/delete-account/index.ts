import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Configuration error");
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Authenticated user client (with incoming JWT)
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: getUserError } = await userClient.auth.getUser();
    if (getUserError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Admin client to delete the auth user
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Hash email and store in deleted_accounts BEFORE deleting user
    const encoder = new TextEncoder();
    const emailData = encoder.encode(userData.user.email!.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Storing email hash for 24h re-registration block');

    const { error: hashError } = await adminClient
      .from('deleted_accounts')
      .insert({ email_hash: emailHash });

    if (hashError) {
      console.error('Failed to store email hash:', hashError);
      // Continue anyway - better to delete account than to block deletion
    }

    // GDPR-compliant: Explicitly delete ALL user data from public tables
    // Order matters: child tables first, then parent tables, finally auth user
    
    const userId = userData.user.id;

    // First, get all strategy IDs for this user
    console.log('Fetching active strategies for user:', userId);
    const { data: strategies, error: strategiesError } = await adminClient
      .from('active_strategies')
      .select('id')
      .eq('user_id', userId);

    if (strategiesError) {
      console.error('Failed to fetch strategies:', strategiesError);
    }

    const strategyIds = strategies?.map(s => s.id) || [];

    if (strategyIds.length > 0) {
      // Delete strategy child tables first
      console.log('Deleting strategy_action_progress for strategies:', strategyIds);
      const { error: actionsError } = await adminClient
        .from('strategy_action_progress')
        .delete()
        .in('strategy_id', strategyIds);
      
      if (actionsError) {
        console.error('Failed to delete strategy_action_progress:', actionsError);
      }

      console.log('Deleting strategy_phase_progress for strategies:', strategyIds);
      const { error: phasesError } = await adminClient
        .from('strategy_phase_progress')
        .delete()
        .in('strategy_id', strategyIds);
      
      if (phasesError) {
        console.error('Failed to delete strategy_phase_progress:', phasesError);
      }

      console.log('Deleting strategy_milestone_progress for strategies:', strategyIds);
      const { error: milestonesError } = await adminClient
        .from('strategy_milestone_progress')
        .delete()
        .in('strategy_id', strategyIds);
      
      if (milestonesError) {
        console.error('Failed to delete strategy_milestone_progress:', milestonesError);
      }

      // Now delete the parent strategies table
      console.log('Deleting active_strategies for user:', userId);
      const { error: strategiesDeleteError } = await adminClient
        .from('active_strategies')
        .delete()
        .eq('user_id', userId);
      
      if (strategiesDeleteError) {
        console.error('Failed to delete active_strategies:', strategiesDeleteError);
      }
    }

    console.log('Deleting business_tools_history for user:', userId);
    const { error: toolsError } = await adminClient
      .from('business_tools_history')
      .delete()
      .eq('user_id', userId);
    
    if (toolsError) {
      console.error('Failed to delete business_tools_history:', toolsError);
    }

    console.log('Deleting user_credits for user:', userId);
    const { error: creditsError } = await adminClient
      .from('user_credits')
      .delete()
      .eq('user_id', userId);
    
    if (creditsError) {
      console.error('Failed to delete user_credits:', creditsError);
    }

    console.log('Deleting profile for user:', userId);
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // Finally: Delete auth.users entry (invalidates login immediately)
    console.log('Deleting auth user:', userId);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Account deletion failed");
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('Account deletion complete - all data removed, login invalidated');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("Operation failed");
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
