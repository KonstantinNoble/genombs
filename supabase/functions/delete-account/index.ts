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
    
    const userId = userData.user.id;
    console.log('Starting GDPR-compliant account deletion for user:', userId);

    // 0. Check if user is a team owner - MUST transfer ownership first
    console.log('Checking team ownership for user:', userId);
    const { data: ownedTeams, error: teamsError } = await adminClient
      .from('team_members')
      .select('team_id, teams(id, name)')
      .eq('user_id', userId)
      .eq('role', 'owner');

    if (!teamsError && ownedTeams && ownedTeams.length > 0) {
      console.log('User owns teams, cannot delete:', ownedTeams);
      return new Response(JSON.stringify({ 
        error: "DELETE_WORKSPACE_REQUIRED",
        teams: ownedTeams.map(t => ({ 
          id: (t.teams as any)?.id, 
          name: (t.teams as any)?.name 
        }))
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 0.5 Remove user from all teams they're a member of (not owner)
    console.log('Removing user from teams:', userId);
    const { error: teamMemberError } = await adminClient
      .from('team_members')
      .delete()
      .eq('user_id', userId);
    
    if (teamMemberError) {
      console.error('Failed to remove from teams:', teamMemberError);
    }

    // 1. Delete decision_records (decision_audit_log deleted via CASCADE)
    console.log('Deleting decision_records for user:', userId);
    const { error: decisionsError } = await adminClient
      .from('decision_records')
      .delete()
      .eq('user_id', userId);
    
    if (decisionsError) {
      console.error('Failed to delete decision_records:', decisionsError);
    }

    // 2. Delete experiments (experiment_tasks and experiment_checkpoints are deleted via CASCADE)
    console.log('Deleting experiments for user:', userId);
    const { error: experimentsError } = await adminClient
      .from('experiments')
      .delete()
      .eq('user_id', userId);
    
    if (experimentsError) {
      console.error('Failed to delete experiments:', experimentsError);
    }

    // 3. Delete validation_analyses
    console.log('Deleting validation_analyses for user:', userId);
    const { error: validationError } = await adminClient
      .from('validation_analyses')
      .delete()
      .eq('user_id', userId);
    
    if (validationError) {
      console.error('Failed to delete validation_analyses:', validationError);
    }

    // 3. Delete user_roles
    console.log('Deleting user_roles for user:', userId);
    const { error: rolesError } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Failed to delete user_roles:', rolesError);
    }

    // 6. Delete user_credits
    console.log('Deleting user_credits for user:', userId);
    const { error: creditsError } = await adminClient
      .from('user_credits')
      .delete()
      .eq('user_id', userId);
    
    if (creditsError) {
      console.error('Failed to delete user_credits:', creditsError);
    }

    // 7. Delete profile
    console.log('Deleting profile for user:', userId);
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // 8. Finally: Delete auth.users entry (invalidates login immediately)
    console.log('Deleting auth user:', userId);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Account deletion failed:", deleteError);
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
    console.error("Operation failed:", e);
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
