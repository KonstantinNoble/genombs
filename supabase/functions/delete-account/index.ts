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
    }

    // GDPR-compliant: Explicitly delete ALL user data from public tables
    const userId = userData.user.id;
    console.log('Starting GDPR-compliant account deletion for user:', userId);

    // 1. Delete improvement_tasks (depends on website_profiles)
    console.log('Deleting improvement_tasks for user:', userId);
    const { error: tasksError } = await adminClient
      .from('improvement_tasks')
      .delete()
      .eq('user_id', userId);
    if (tasksError) {
      console.error('Failed to delete improvement_tasks:', tasksError);
    }

    // 1a. Delete daily_tasks (GDPR - gamification)
    console.log('Deleting daily_tasks for user:', userId);
    const { error: dailyTasksError } = await adminClient
      .from('daily_tasks')
      .delete()
      .eq('user_id', userId);
    if (dailyTasksError) {
      console.error('Failed to delete daily_tasks:', dailyTasksError);
    }

    // 1b. Delete user_badges (GDPR - gamification)
    console.log('Deleting user_badges for user:', userId);
    const { error: badgesError } = await adminClient
      .from('user_badges')
      .delete()
      .eq('user_id', userId);
    if (badgesError) {
      console.error('Failed to delete user_badges:', badgesError);
    }

    // 1c. Delete user_streaks (GDPR - gamification)
    console.log('Deleting user_streaks for user:', userId);
    const { error: streaksError } = await adminClient
      .from('user_streaks')
      .delete()
      .eq('user_id', userId);
    if (streaksError) {
      console.error('Failed to delete user_streaks:', streaksError);
    }

    // 1d. Delete analysis_snapshots (GDPR - score history)
    console.log('Deleting analysis_snapshots for user:', userId);
    const { error: snapshotsError } = await adminClient
      .from('analysis_snapshots')
      .delete()
      .eq('user_id', userId);
    if (snapshotsError) {
      console.error('Failed to delete analysis_snapshots:', snapshotsError);
    }

    // 2. Fetch conversation IDs for message deletion
    const { data: convData } = await adminClient
      .from('conversations')
      .select('id')
      .eq('user_id', userId);
    const conversationIds = (convData || []).map((c: { id: string }) => c.id);

    // 3. Delete messages (depends on conversations, no direct user_id)
    if (conversationIds.length > 0) {
      console.log('Deleting messages for', conversationIds.length, 'conversations');
      const { error: messagesError } = await adminClient
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);
      if (messagesError) {
        console.error('Failed to delete messages:', messagesError);
      }
    }

    // 4. Delete website_profiles (depends on conversations)
    console.log('Deleting website_profiles for user:', userId);
    const { error: wpError } = await adminClient
      .from('website_profiles')
      .delete()
      .eq('user_id', userId);
    if (wpError) {
      console.error('Failed to delete website_profiles:', wpError);
    }

    // 5. Delete analysis_queue
    console.log('Deleting analysis_queue for user:', userId);
    const { error: queueError } = await adminClient
      .from('analysis_queue')
      .delete()
      .eq('user_id', userId);
    if (queueError) {
      console.error('Failed to delete analysis_queue:', queueError);
    }

    // 6. Delete conversations (now free of dependencies)
    console.log('Deleting conversations for user:', userId);
    const { error: convsError } = await adminClient
      .from('conversations')
      .delete()
      .eq('user_id', userId);
    if (convsError) {
      console.error('Failed to delete conversations:', convsError);
    }

    // 7. Delete user_roles
    console.log('Deleting user_roles for user:', userId);
    const { error: rolesError } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (rolesError) {
      console.error('Failed to delete user_roles:', rolesError);
    }

    // 8. Delete user_credits
    console.log('Deleting user_credits for user:', userId);
    const { error: creditsError } = await adminClient
      .from('user_credits')
      .delete()
      .eq('user_id', userId);
    if (creditsError) {
      console.error('Failed to delete user_credits:', creditsError);
    }

    // 9. Delete profile
    console.log('Deleting profile for user:', userId);
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) {
      console.error('Failed to delete profile:', profileError);
    }

    // 4. Finally: Delete auth.users entry (invalidates login immediately)
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
