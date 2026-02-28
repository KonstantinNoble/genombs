import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MONTHLY_PUBLISH_LIMIT = 5;

/**
 * Generate a URL-safe slug from a website URL.
 * Mirrors the client-side generateSlug() in src/lib/utils.ts.
 */
function generateSlug(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Service unavailable" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ── Authenticate the caller ──
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: getUserError } = await userClient.auth.getUser();
    if (getUserError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = userData.user.id;

    // Admin client for privileged operations
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // ── Parse request body ──
    const body = await req.json();
    const { action, profileId } = body as {
      action: "publish" | "unpublish";
      profileId: string;
    };

    if (!action || !profileId) {
      return new Response(
        JSON.stringify({ error: "Missing action or profileId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ── Verify the profile belongs to this user ──
    const { data: profile, error: profileError } = await admin
      .from("website_profiles")
      .select("id, url, user_id, is_public, public_slug, status")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (profile.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (profile.status !== "completed") {
      return new Response(
        JSON.stringify({ error: "Only completed analyses can be published" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ════════════════════════════════════════
    //   UNPUBLISH
    // ════════════════════════════════════════
    if (action === "unpublish") {
      if (!profile.is_public) {
        return new Response(
          JSON.stringify({ error: "Profile is not published" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error: unpubError } = await admin
        .from("website_profiles")
        .update({ is_public: false })
        .eq("id", profileId);

      if (unpubError) {
        console.error("Unpublish error:", unpubError);
        return new Response(
          JSON.stringify({ error: "Failed to unpublish" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, action: "unpublished" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ════════════════════════════════════════
    //   PUBLISH
    // ════════════════════════════════════════

    // 1) Server-side premium check
    const { data: credits, error: creditsError } = await admin
      .from("user_credits")
      .select("is_premium, subscription_end_date, auto_renew")
      .eq("user_id", userId)
      .single();

    if (creditsError || !credits) {
      return new Response(
        JSON.stringify({ error: "Could not verify premium status" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let isPremium = credits.is_premium ?? false;
    if (isPremium && credits.auto_renew === false && credits.subscription_end_date) {
      const endDate = new Date(credits.subscription_end_date);
      if (endDate < new Date()) {
        isPremium = false;
      }
    }

    if (!isPremium) {
      return new Response(
        JSON.stringify({ error: "Premium subscription required to publish scores" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2) Server-side monthly limit check (uses the same RPC)
    const { data: monthlyCount, error: countError } = await admin
      .rpc("get_monthly_publish_count", { _user_id: userId });

    if (countError) {
      console.error("Monthly count error:", countError);
      return new Response(
        JSON.stringify({ error: "Could not verify monthly usage" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const currentUsage = typeof monthlyCount === "number" ? monthlyCount : 0;
    if (currentUsage >= MONTHLY_PUBLISH_LIMIT) {
      const nextReset = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" });

      return new Response(
        JSON.stringify({
          error: `Monthly limit reached (${MONTHLY_PUBLISH_LIMIT}/${MONTHLY_PUBLISH_LIMIT}). Resets ${nextReset}.`,
          monthlyUsed: currentUsage,
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 3) Enforce single active backlink: unpublish any other published profile
    const { data: existingPublished } = await admin
      .from("website_profiles")
      .select("id")
      .eq("user_id", userId)
      .eq("is_public", true)
      .neq("id", profileId);

    if (existingPublished && existingPublished.length > 0) {
      // Unpublish all other published profiles (should be max 1, but handle edge cases)
      const ids = existingPublished.map((p: { id: string }) => p.id);
      const { error: batchUnpubError } = await admin
        .from("website_profiles")
        .update({ is_public: false })
        .in("id", ids);

      if (batchUnpubError) {
        console.error("Failed to unpublish existing profiles:", batchUnpubError);
        return new Response(
          JSON.stringify({ error: "Failed to remove existing backlink. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log(`Unpublished ${ids.length} existing profile(s) for user ${userId}`);
    }

    // 4) Publish the requested profile with a unique slug
    const baseSlug = generateSlug(profile.url);
    let finalSlug = "";
    let published = false;

    for (let attempt = 0; attempt < 5; attempt++) {
      const candidateSlug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;
      const { error: pubError } = await admin
        .from("website_profiles")
        .update({
          is_public: true,
          public_slug: candidateSlug,
          published_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (!pubError) {
        finalSlug = candidateSlug;
        published = true;
        break;
      }

      // Only retry on unique constraint violations (PostgreSQL error code 23505)
      if (pubError.code !== "23505" && !pubError.message?.includes("unique") && !pubError.message?.includes("duplicate")) {
        console.error("Publish update error:", pubError);
        return new Response(
          JSON.stringify({ error: "Failed to publish. Please try again." }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (!published) {
      return new Response(
        JSON.stringify({ error: "Could not generate a unique URL after 5 attempts. Please try again." }),
        { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 5) Track usage in publish_usage table
    const { error: usageError } = await admin
      .from("publish_usage")
      .insert({ user_id: userId, website_profile_id: profileId });

    if (usageError) {
      console.error("publish_usage insert failed:", usageError);
      // Non-fatal: the publish succeeded, log but don't rollback
    }

    // 6) Re-fetch final count to return to client
    const { data: updatedCount } = await admin
      .rpc("get_monthly_publish_count", { _user_id: userId });

    const publicUrl = `https://synvertas.com/scores/${finalSlug}`;

    return new Response(
      JSON.stringify({
        success: true,
        action: "published",
        publicUrl,
        slug: finalSlug,
        monthlyUsed: typeof updatedCount === "number" ? updatedCount : currentUsage + 1,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error("publish-score error:", e);
    return new Response(
      JSON.stringify({ error: "Service unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
