import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// External Supabase project credentials (publishable, safe for client-side)
const EXTERNAL_SUPABASE_URL = "https://xnkspttfhcnqzhmazggn.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhua3NwdHRmaGNucXpobWF6Z2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDU0NDAsImV4cCI6MjA4NjMyMTQ0MH0.AluwfNe4T-tJQo73ResSpnqZ3Dky34CBv50ubxX2_ec";

const CUSTOMER_SEARCH_COST = 10;
const FREE_DAILY_LIMIT = 2;
const PREMIUM_DAILY_LIMIT = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!firecrawlKey || !perplexityKey || !geminiKey) {
      return new Response(JSON.stringify({ error: "Required API keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth – validate JWT against external Supabase project
    const authHeader = req.headers.get("Authorization") ?? "";
    const externalClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: userData, error: getUserError } = await externalClient.auth.getUser();
    if (getUserError || !userData?.user) {
      console.error("Auth error:", getUserError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    // Lovable Cloud admin client for DB operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Parse input
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credit check
    const { data: credits } = await adminClient
      .from("user_credits")
      .select("id, is_premium, daily_credits_limit, credits_used, credits_reset_at")
      .eq("user_id", userId)
      .maybeSingle() as { data: { id: string; is_premium: boolean; daily_credits_limit: number; credits_used: number; credits_reset_at: string } | null };

    if (!credits) {
      return new Response(JSON.stringify({ error: "User credits not found" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let creditsUsed = credits.credits_used ?? 0;
    const resetAt = new Date(credits.credits_reset_at);
    if (resetAt < new Date()) {
      creditsUsed = 0;
      await adminClient
        .from("user_credits")
        .update({ credits_used: 0, credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
        .eq("id", credits.id);
    }

    const remaining = credits.daily_credits_limit - creditsUsed;
    if (remaining < CUSTOMER_SEARCH_COST) {
      const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
      return new Response(JSON.stringify({ error: `insufficient_credits:${hoursLeft}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily feature usage limit check
    const dailyLimit = credits.is_premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const { data: usage } = await adminClient
      .from("feature_usage")
      .select("id, used_today, reset_at")
      .eq("user_id", userId)
      .eq("feature", "customer_search")
      .maybeSingle() as { data: { id: string; used_today: number; reset_at: string } | null };

    let currentUsage = 0;
    if (usage) {
      const usageResetAt = new Date(usage.reset_at);
      if (usageResetAt < new Date()) {
        // Reset
        await adminClient
          .from("feature_usage")
          .update({ used_today: 0, reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", usage.id);
        currentUsage = 0;
      } else {
        currentUsage = usage.used_today;
      }
    }

    if (currentUsage >= dailyLimit) {
      return new Response(JSON.stringify({ error: `daily_limit_reached:customer_search:${dailyLimit}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Firecrawl scrape
    console.log("Step 1: Scraping URL with Firecrawl:", url);
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const firecrawlResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 8000,
      }),
    });

    const firecrawlData = await firecrawlResp.json();
    if (!firecrawlResp.ok) {
      console.error("Firecrawl error:", firecrawlData);
      return new Response(JSON.stringify({ error: "Failed to scrape website" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const websiteContent = firecrawlData.data?.markdown || firecrawlData.markdown || "";
    const websiteTitle = firecrawlData.data?.metadata?.title || formattedUrl;

    // Step 2: Perplexity live search for communities
    console.log("Step 2: Searching communities with Perplexity");
    const perplexityPrompt = `Find online communities, forums, subreddits, Facebook groups, Discord servers, LinkedIn groups, YouTube channels, TikTok creators, X/Twitter accounts, Quora topics, and niche forums where potential customers of "${websiteTitle}" (${formattedUrl}) are actively discussing related topics.

Website summary (first 2000 chars):
${websiteContent.slice(0, 2000)}

Return a JSON object with this structure:
{
  "communities": [
    {
      "platform": "Reddit|YouTube|LinkedIn|X|Facebook|Discord|TikTok|Quora|Forum|Other",
      "name": "Community name",
      "url": "https://...",
      "relevance": "high|medium",
      "audience_size": "estimated size or activity level",
      "engagement_tip": "How to approach this community authentically"
    }
  ]
}

Rules:
- Find 10-20 communities across ALL platforms
- URLs must be real and working
- Focus on communities where the target audience actively discusses problems this product solves
- Include subreddits, YouTube channels, LinkedIn groups, Facebook groups, Discord servers, TikTok hashtags/creators, Quora spaces, niche forums
- Return ONLY valid JSON`;

    const ppxResp = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: perplexityPrompt }],
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    const ppxData = await ppxResp.json();
    if (!ppxResp.ok) {
      console.error("Perplexity error:", ppxData);
      return new Response(JSON.stringify({ error: "Community search failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const communitiesRaw = ppxData.choices?.[0]?.message?.content || "";
    let communities: any[] = [];
    try {
      const parsed = JSON.parse(communitiesRaw);
      communities = parsed.communities || [];
    } catch {
      const jsonMatch = communitiesRaw.match(/```json?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        communities = JSON.parse(jsonMatch[1]).communities || [];
      } else {
        const objMatch = communitiesRaw.match(/\{[\s\S]*"communities"[\s\S]*\}/);
        if (objMatch) {
          communities = JSON.parse(objMatch[0]).communities || [];
        }
      }
    }

    // Step 3: Gemini synthesis → ICP + refined communities
    console.log("Step 3: Synthesizing with Gemini");
    const geminiPrompt = `Based on the following website content and discovered communities, create a comprehensive Customer Map.

Website: ${websiteTitle} (${formattedUrl})
Website Content (first 3000 chars):
${websiteContent.slice(0, 3000)}

Discovered Communities:
${JSON.stringify(communities, null, 2)}

Create a structured Customer Map with:
1. **Product Summary**: What this product/service does in 2-3 sentences
2. **ICP (Ideal Customer Profile)**:
   - Demographics (age, role, industry, company size)
   - Pain points (top 3-5 problems they face)
   - Buying motivations (why they'd purchase)
   - Where they spend time online
   - How they make decisions
3. **Communities**: Refined list with platform-specific approach tips

Return ONLY a JSON object:
{
  "product_summary": "...",
  "icp": {
    "demographics": { "age_range": "...", "roles": ["..."], "industries": ["..."], "company_size": "..." },
    "pain_points": ["..."],
    "buying_motivations": ["..."],
    "online_behavior": "...",
    "decision_process": "..."
  },
  "communities": [
    {
      "platform": "Reddit|YouTube|LinkedIn|X|Facebook|Discord|TikTok|Quora|Forum|Other",
      "name": "...",
      "url": "https://...",
      "relevance": "high|medium",
      "audience_size": "...",
      "engagement_tip": "..."
    }
  ]
}`;

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 8192 },
        }),
      }
    );

    const geminiData = await geminiResp.json();
    if (!geminiResp.ok) {
      console.error("Gemini error:", geminiData);
      return new Response(JSON.stringify({ error: "AI synthesis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let customerMap: any = {};
    try {
      customerMap = JSON.parse(geminiText);
    } catch {
      const jsonMatch = geminiText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        customerMap = JSON.parse(jsonMatch[1]);
      } else {
        const objMatch = geminiText.match(/\{[\s\S]*"product_summary"[\s\S]*\}/);
        if (objMatch) {
          customerMap = JSON.parse(objMatch[0]);
        } else {
          console.error("Could not parse Gemini response:", geminiText);
          return new Response(JSON.stringify({ error: "Could not parse AI response" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Save to customer_maps table
    const { data: savedMap, error: saveError } = await adminClient
      .from("customer_maps")
      .insert({
        user_id: userId,
        url: formattedUrl,
        product_summary: customerMap.product_summary || "",
        icp_data: customerMap.icp || {},
        communities: customerMap.communities || [],
        model_used: "gemini-flash+perplexity",
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save customer map:", saveError);
    }

    // Deduct credits
    await adminClient
      .from("user_credits")
      .update({ credits_used: creditsUsed + CUSTOMER_SEARCH_COST })
      .eq("id", credits.id);

    // Update feature usage
    if (usage) {
      await adminClient
        .from("feature_usage")
        .update({ used_today: currentUsage + 1 })
        .eq("id", usage.id);
    } else {
      await adminClient
        .from("feature_usage")
        .insert({
          user_id: userId,
          feature: "customer_search",
          used_today: 1,
          reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    console.log("Customer search complete for", formattedUrl);

    return new Response(JSON.stringify({
      id: savedMap?.id,
      url: formattedUrl,
      product_summary: customerMap.product_summary,
      icp: customerMap.icp,
      communities: customerMap.communities,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("customer-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Service unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
