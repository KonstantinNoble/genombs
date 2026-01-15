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

    // 1. Delete ads_advisor_history
    console.log('Deleting ads_advisor_history for user:', userId);
    const { error: adsError } = await adminClient
      .from('ads_advisor_history')
      .delete()
      .eq('user_id', userId);
    
    if (adsError) {
      console.error('Failed to delete ads_advisor_history:', adsError);
    }

    // 2. Delete business_tools_history
    console.log('Deleting business_tools_history for user:', userId);
    const { error: toolsError } = await adminClient
      .from('business_tools_history')
      .delete()
      .eq('user_id', userId);
    
    if (toolsError) {
      console.error('Failed to delete business_tools_history:', toolsError);
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

    // 4. Delete user_credits
    console.log('Deleting user_credits for user:', userId);
    const { error: creditsError } = await adminClient
      .from('user_credits')
      .delete()
      .eq('user_id', userId);
    
    if (creditsError) {
      console.error('Failed to delete user_credits:', creditsError);
    }

    // 5. Delete profile
    console.log('Deleting profile for user:', userId);
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // 6. Finally: Delete auth.users entry (invalidates login immediately)
    console.log('Deleting auth user:', userId);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Account deletion failed:", deleteError);
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log('✅ Account deletion complete - all data removed, login invalidated');
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
