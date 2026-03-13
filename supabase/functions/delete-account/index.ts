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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = req.headers.get("apikey") ?? "";

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("Configuration error: missing env vars");
      return json({ error: "Service unavailable" }, 500);
    }

    // ── Verify who is calling ─────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: getUserError } = await userClient.auth.getUser();
    if (getUserError || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userId = userData.user.id;
    const email = userData.user.email!.toLowerCase().trim();

    console.log("Starting GDPR-compliant account deletion for user:", userId);

    // Admin client — bypasses RLS for hard deletes
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── Step 1: Store email hash BEFORE deleting auth user ────────────────────
    //           This enforces the 24h re-registration block.
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(email),
    );
    const emailHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error: hashError } = await adminClient
      .from("deleted_accounts")
      .insert({ email_hash: emailHash });

    if (hashError) {
      // Non-fatal: duplicate hash = user was already blocked once, that's fine
      console.warn("Could not store email hash:", hashError.message);
    }

    // ── Step 2: Delete Gateway data ───────────────────────────────────────────
    //           (children before parents for safety, CASCADE covers ON DELETE)

    const { error: logsErr } = await adminClient
      .from("gateway_request_logs").delete().eq("user_id", userId);
    if (logsErr) console.error("gateway_request_logs:", logsErr.message);

    const { error: cacheErr } = await adminClient
      .from("gateway_cache_entries").delete().eq("user_id", userId);
    if (cacheErr) console.error("gateway_cache_entries:", cacheErr.message);

    const { error: settingsErr } = await adminClient
      .from("gateway_settings").delete().eq("user_id", userId);
    if (settingsErr) console.error("gateway_settings:", settingsErr.message);

    const { error: saasKeyErr } = await adminClient
      .from("gateway_saas_keys").delete().eq("user_id", userId);
    if (saasKeyErr) console.error("gateway_saas_keys:", saasKeyErr.message);

    const { error: providerKeyErr } = await adminClient
      .from("gateway_provider_keys").delete().eq("user_id", userId);
    if (providerKeyErr) console.error("gateway_provider_keys:", providerKeyErr.message);

    // ── Step 3: Delete Core infrastructure data ───────────────────────────────

    const { error: rolesErr } = await adminClient
      .from("user_roles").delete().eq("user_id", userId);
    if (rolesErr) console.error("user_roles:", rolesErr.message);

    const { error: creditsErr } = await adminClient
      .from("user_credits").delete().eq("user_id", userId);
    if (creditsErr) console.error("user_credits:", creditsErr.message);

    const { error: profileErr } = await adminClient
      .from("profiles").delete().eq("id", userId);
    if (profileErr) console.error("profiles:", profileErr.message);

    // ── Step 4: Delete the auth.users entry — invalidates all sessions ─────────
    console.log("Deleting auth user:", userId);
    const { error: deleteAuthErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      console.error("Auth user deletion failed:", deleteAuthErr.message);
      return json({ error: "Account deletion failed at authentication level." }, 500);
    }

    console.log("Account deletion complete — all data removed, login invalidated.");
    return json({ success: true }, 200);

  } catch (e: unknown) {
    console.error("Unexpected error during account deletion:", e);
    return json({ error: "Service unavailable" }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
