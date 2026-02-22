import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMPETITOR_SEARCH_COST = 7;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!perplexityKey) {
      return new Response(JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: userData, error: getUserError } = await userClient.auth.getUser();
    if (getUserError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const { conversationId } = await req.json();

    if (!conversationId) {
      return new Response(JSON.stringify({ error: "conversationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Credit check
    const { data: credits } = await adminClient
      .from("user_credits")
      .select("id, is_premium, daily_credits_limit, credits_used, credits_reset_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (credits) {
      const resetAt = new Date(credits.credits_reset_at);
      let creditsUsed = credits.credits_used ?? 0;
      if (resetAt < new Date()) {
        creditsUsed = 0;
        await adminClient
          .from("user_credits")
          .update({ credits_used: 0, credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", credits.id);
      }
      const limit = credits.daily_credits_limit ?? 20;
      const remaining = limit - creditsUsed;
      if (remaining < COMPETITOR_SEARCH_COST) {
        const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
        return new Response(JSON.stringify({ error: `insufficient_credits:${hoursLeft}` }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get the own website profile for this conversation
    const { data: ownProfile, error: profileError } = await adminClient
      .from("website_profiles")
      .select("url, profile_data")
      .eq("conversation_id", conversationId)
      .eq("is_own_website", true)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError || !ownProfile) {
      return new Response(JSON.stringify({ error: "No completed own website profile found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileData = ownProfile.profile_data as Record<string, unknown> | null;
    const siteName = (profileData?.name as string) || ownProfile.url;
    const targetAudience = (profileData?.targetAudience as string) || "";
    const usp = (profileData?.usp as string) || "";

    // Build Perplexity prompt
    const prompt = `Find exactly 5 direct competitors for the website "${ownProfile.url}" (${siteName}).
${targetAudience ? `Target audience: ${targetAudience}.` : ""}
${usp ? `Their USP: ${usp}.` : ""}

Return ONLY a JSON object with this exact structure:
{
  "competitors": [
    { "url": "https://competitor.com", "name": "Competitor Name", "description": "One-line description of what they do" }
  ]
}

Rules:
- Return exactly 5 competitors
- URLs must be real, working websites
- Competitors must be in the same industry/niche
- Description should be max 15 words
- Do NOT include the original website
- Return ONLY valid JSON, no markdown, no explanation`;

    // Call Perplexity sonar-pro
    const ppxResp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    const ppxData = await ppxResp.json();
    if (!ppxResp.ok) {
      console.error("Perplexity error:", ppxData);
      return new Response(JSON.stringify({ error: "Competitor search failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawText = ppxData.choices?.[0]?.message?.content || "";
    let competitors: Array<{ url: string; name: string; description: string }> = [];

    try {
      const parsed = JSON.parse(rawText);
      competitors = parsed.competitors || [];
    } catch {
      // Try extracting JSON from markdown
      const jsonMatch = rawText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        competitors = parsed.competitors || [];
      } else {
        // Try finding JSON object in text
        const objMatch = rawText.match(/\{[\s\S]*"competitors"[\s\S]*\}/);
        if (objMatch) {
          const parsed = JSON.parse(objMatch[0]);
          competitors = parsed.competitors || [];
        } else {
          console.error("Could not parse Perplexity response:", rawText);
          return new Response(JSON.stringify({ error: "Could not parse competitor results" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Filter and validate
    competitors = competitors
      .filter((c) => c.url && c.name)
      .slice(0, 5)
      .map((c) => ({
        url: c.url.startsWith("http") ? c.url : `https://${c.url}`,
        name: c.name,
        description: c.description || "",
      }));

    // Save as message with metadata
    const { error: msgError } = await adminClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: `I found ${competitors.length} potential competitors for ${siteName}. Select the ones you'd like to analyze:`,
        metadata: { type: "competitor_suggestions", competitors },
      });

    if (msgError) {
      console.error("Failed to save competitor message:", msgError);
    }

    // Deduct credits
    if (credits) {
      const resetAt = new Date(credits.credits_reset_at);
      let currentUsed = credits.credits_used ?? 0;
      if (resetAt < new Date()) currentUsed = 0;
      await adminClient
        .from("user_credits")
        .update({ credits_used: currentUsed + COMPETITOR_SEARCH_COST })
        .eq("id", credits.id);
    }

    return new Response(JSON.stringify({ competitors }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-competitors error:", e);
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
