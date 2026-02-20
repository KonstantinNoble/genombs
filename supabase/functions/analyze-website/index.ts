import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * analyze-website
 *
 * 1. Scrapes the given URL via Firecrawl (markdown + html + links + screenshot)
 * 2. Extracts SEO meta-data from the HTML
 * 3. Sends enriched context to the selected AI model to produce a structured website profile
 * 4. Stores the result in `website_profiles`
 *
 * Required secrets: FIRECRAWL_API_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional secrets: OPENAI_API_KEY, ANTHROPIC_API_KEY, PERPLEXITY_API_KEY
 */

// ─── SEO Data Extraction ───

interface SEOData {
  title: string | null;
  metaDescription: string | null;
  viewport: string | null;
  robots: string | null;
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  jsonLd: string[];
}

function extractSEOData(html: string): SEOData {
  const getMetaContent = (nameOrProperty: string): string | null => {
    const regex = new RegExp(
      `<meta\\s+(?:[^>]*?(?:name|property)\\s*=\\s*["']${nameOrProperty}["'][^>]*?content\\s*=\\s*["']([^"']*?)["']|[^>]*?content\\s*=\\s*["']([^"']*?)["'][^>]*?(?:name|property)\\s*=\\s*["']${nameOrProperty}["'])`,
      "i"
    );
    const match = html.match(regex);
    return match ? (match[1] || match[2] || null) : null;
  };

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // Canonical
  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*?)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  // JSON-LD structured data
  const jsonLd: string[] = [];
  const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      // Validate it's valid JSON
      JSON.parse(jsonLdMatch[1].trim());
      jsonLd.push(jsonLdMatch[1].trim());
    } catch {
      // Skip invalid JSON-LD
    }
  }

  return {
    title,
    metaDescription: getMetaContent("description"),
    viewport: getMetaContent("viewport"),
    robots: getMetaContent("robots"),
    canonical,
    ogTitle: getMetaContent("og:title"),
    ogDescription: getMetaContent("og:description"),
    ogImage: getMetaContent("og:image"),
    jsonLd,
  };
}

function buildEnrichedContext(
  url: string,
  markdown: string,
  seo: SEOData,
  links: { internal: number; external: number }
): string {
  const sections: string[] = [];

  sections.push(`Website URL: ${url}`);
  sections.push("");
  sections.push("=== SEO & TECHNICAL DATA ===");
  sections.push(`Title Tag: ${seo.title ? `"${seo.title}"` : "MISSING"}`);
  sections.push(`Meta Description: ${seo.metaDescription ? `"${seo.metaDescription}"` : "MISSING"}`);
  sections.push(`Viewport Meta: ${seo.viewport ? `"${seo.viewport}"` : "NOT FOUND in static HTML"}`);
  sections.push(`Robots Meta: ${seo.robots ? `"${seo.robots}"` : "not set (defaults to index, follow)"}`);
  sections.push(`Canonical URL: ${seo.canonical || "not set"}`);

  if (seo.ogTitle || seo.ogDescription || seo.ogImage) {
    const ogParts: string[] = [];
    if (seo.ogTitle) ogParts.push(`og:title="${seo.ogTitle}"`);
    if (seo.ogDescription) ogParts.push(`og:description="${seo.ogDescription}"`);
    if (seo.ogImage) ogParts.push(`og:image="${seo.ogImage}"`);
    sections.push(`Open Graph: ${ogParts.join(", ")}`);
  } else {
    sections.push("Open Graph Tags: MISSING");
  }

  if (seo.jsonLd.length > 0) {
    // Only include first 3 to avoid token bloat
    const truncated = seo.jsonLd.slice(0, 3);
    sections.push(`Structured Data (JSON-LD): ${truncated.length} block(s) found`);
    for (const ld of truncated) {
      // Truncate each block to 500 chars
      sections.push(ld.length > 500 ? ld.substring(0, 500) + "..." : ld);
    }
  } else {
    sections.push("Structured Data (JSON-LD): NONE");
  }

  sections.push(`Internal Links: ${links.internal}`);
  sections.push(`External Links: ${links.external}`);

  sections.push("");
  sections.push("=== WEBSITE CONTENT ===");
  sections.push(markdown);

  return sections.join("\n");
}

// ─── Analysis Prompt ───

const ANALYSIS_SYSTEM_PROMPT = `You are an expert website analyst. You receive both the website's text content AND its technical SEO metadata (title tag, meta description, viewport, robots, Open Graph tags, structured data, link counts).

Analyze all provided data and return a JSON object with exactly this structure:

{
  "profileData": {
    "name": "Company/website name",
    "targetAudience": "Description of the target audience",
    "usp": "Unique selling proposition",
    "ctas": ["CTA 1", "CTA 2"],
    "siteStructure": ["Page 1", "Page 2"],
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
  },
  "categoryScores": {
    "findability": N,
    "mobileUsability": N,
    "offerClarity": N,
    "trustProof": N,
    "conversionReadiness": N
  },
  "overallScore": N
}

SCORING GUIDELINES (0-100 for each category):

**findability**: Base this on the ACTUAL technical data provided:
- Is there a title tag? Is it well-crafted (under 60 chars, contains keywords)?
- Is there a meta description? Is it compelling (under 160 chars)?
- Are Open Graph tags present for social sharing?
- Is there structured data (JSON-LD)? What types?
- How many internal vs external links are there?
- Each MISSING element (title, description, OG tags, structured data) should lower the score by 5-15 points depending on importance.
- A site with all technical tags present AND good content: 80-100.
- A site missing some tags but with strong content and structure: 50-75.
- A site missing most tags: 30-50 regardless of content quality.

**mobileUsability**: Evaluate mobile responsiveness:
- Viewport meta tag present ("width=device-width, initial-scale=1"): strong positive signal (+20 points baseline).
- Viewport meta NOT FOUND: note as a weakness. Deduct 15-25 points, but do not cap at 40 since some frameworks inject it via JavaScript.
- Content structure: headings, readability, text blocks, content organization.
- Score 70-100: viewport present AND good content structure.
- Score 45-70: viewport missing BUT content structure suggests responsive design.
- Score 20-45: viewport missing AND poor content structure.

**offerClarity**: How clear is the value proposition and offer based on the content?

**trustProof**: Trust signals like reviews, certifications, testimonials, about page, team info.

**conversionReadiness**: CTAs, booking forms, contact options, clear next steps.

IMPORTANT: When technical data shows "MISSING", reflect this proportionally in the scores and mention it in weaknesses. Missing elements are real weaknesses even if some may be injected dynamically. Score based on what is actually verifiable in the provided data.

Respond ONLY with valid JSON, no markdown, no explanation.`;

// ─── Provider-specific analysis functions ───

async function analyzeWithGemini(content: string, apiKey: string): Promise<unknown> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: ANALYSIS_SYSTEM_PROMPT },
              { text: content },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  const data = await resp.json();
  if (!resp.ok) {
    console.error("Gemini error:", data);
    throw new Error(`Gemini API error: ${resp.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseJsonResponse(text);
}

async function analyzeWithOpenAI(content: string, apiKey: string, modelName: string): Promise<unknown> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("OpenAI error:", data);
    throw new Error(`OpenAI API error: ${resp.status}`);
  }

  const text = data.choices?.[0]?.message?.content || "";
  return parseJsonResponse(text);
}

async function analyzeWithAnthropic(content: string, apiKey: string): Promise<unknown> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        { role: "user", content },
      ],
      max_tokens: 8192,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("Anthropic error:", data);
    throw new Error(`Anthropic API error: ${resp.status}`);
  }

  const text = data.content?.[0]?.text || "";
  return parseJsonResponse(text);
}

async function analyzeWithPerplexity(content: string, apiKey: string): Promise<unknown> {
  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    console.error("Perplexity error:", data);
    throw new Error(`Perplexity API error: ${resp.status}`);
  }

  const text = data.choices?.[0]?.message?.content || "";
  return parseJsonResponse(text);
}

function parseJsonResponse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code block
    const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("Could not parse AI response as JSON");
  }
}

// ─── Model Router ───

type ModelId = "gemini-flash" | "gpt-mini" | "gpt" | "claude-sonnet" | "perplexity";

async function routeAnalysis(model: ModelId, content: string): Promise<unknown> {
  switch (model) {
    case "gemini-flash": {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) throw new Error("GEMINI_API_KEY not configured");
      return analyzeWithGemini(content, key);
    }
    case "gpt-mini": {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) throw new Error("OPENAI_API_KEY not configured");
      return analyzeWithOpenAI(content, key, "gpt-4o-mini");
    }
    case "gpt": {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) throw new Error("OPENAI_API_KEY not configured");
      return analyzeWithOpenAI(content, key, "gpt-4o");
    }
    case "claude-sonnet": {
      const key = Deno.env.get("ANTHROPIC_API_KEY");
      if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
      return analyzeWithAnthropic(content, key);
    }
    case "perplexity": {
      const key = Deno.env.get("PERPLEXITY_API_KEY");
      if (!key) throw new Error("PERPLEXITY_API_KEY not configured");
      return analyzeWithPerplexity(content, key);
    }
    default: {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) throw new Error("GEMINI_API_KEY not configured");
      return analyzeWithGemini(content, key);
    }
  }
}

// ─── Main handler ───

// ─── Credit system constants ───

const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"];

// Model-specific credit costs for analysis
const ANALYSIS_CREDIT_COSTS: Record<string, number> = {
  "gemini-flash": 9,
  "gpt-mini": 9,
  "gpt": 12,
  "claude-sonnet": 12,
  "perplexity": 14,
};

function getAnalysisCreditCost(modelKey: string): number {
  return ANALYSIS_CREDIT_COSTS[modelKey] ?? 9;
}

// ─── Credit refund helper ───

async function refundCredits(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  cost: number,
  reason: string
): Promise<void> {
  try {
    const { data } = await supabaseAdmin
      .from("user_credits")
      .select("id, credits_used")
      .eq("user_id", userId)
      .single();

    if (data) {
      const newUsed = Math.max(0, (data.credits_used ?? 0) - cost);
      await supabaseAdmin
        .from("user_credits")
        .update({ credits_used: newUsed })
        .eq("id", data.id);
      console.log(`Credits refunded: ${cost} for user ${userId} (${reason})`);
    }
  } catch (e) {
    console.error("Credit refund failed:", e);
  }
}

function isExpensiveModel(modelKey: string): boolean {
  return EXPENSIVE_MODELS.includes(modelKey);
}

async function checkAndDeductAnalysisCredits(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  modelKey: string,
  isPremiumRequired: boolean
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  try {
    const { data: baseCredits, error: baseError } = await supabaseAdmin
      .from("user_credits")
      .select("id, is_premium")
      .eq("user_id", userId)
      .maybeSingle();

    if (baseError) {
      console.warn("Credits query failed, skipping credit check:", baseError.message);
      return { ok: true };
    }

    if (isPremiumRequired && (!baseCredits || !baseCredits.is_premium)) {
      return { ok: false, status: 403, error: "premium_model_required" };
    }

    if (!baseCredits) {
      return { ok: true };
    }

    const { data: credits, error: creditsError } = await supabaseAdmin
      .from("user_credits")
      .select("id, is_premium, daily_credits_limit, credits_used, credits_reset_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (creditsError || !credits) {
      console.warn("Credit columns not available, skipping:", creditsError?.message);
      return { ok: true };
    }

    const resetAt = new Date(credits.credits_reset_at);
    let creditsUsed = credits.credits_used ?? 0;
    if (resetAt < new Date()) {
      creditsUsed = 0;
      await supabaseAdmin
        .from("user_credits")
        .update({ credits_used: 0, credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
        .eq("id", credits.id);
    }

    const cost = getAnalysisCreditCost(modelKey);
    const limit = credits.daily_credits_limit ?? 20;
    const remaining = limit - creditsUsed;

    if (remaining < cost) {
      const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
      return { ok: false, status: 403, error: `insufficient_credits:${hoursLeft}` };
    }

    await supabaseAdmin
      .from("user_credits")
      .update({ credits_used: creditsUsed + cost })
      .eq("id", credits.id);

    return { ok: true };
  } catch (e) {
    console.warn("Credit check failed unexpectedly, allowing request:", e);
    return { ok: true };
  }
}

// ─── Main handler ───

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let creditsDeducted = false;
  let refundUserId = "";
  let refundModel = "gemini-flash";

  try {
    const { url, conversationId, isOwnWebsite, model = "gemini-flash", githubRepoUrl } = await req.json();
    refundModel = model;

    if (!url || !conversationId) {
      return new Response(
        JSON.stringify({ error: "url and conversationId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create authenticated client to get user id
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

    // Admin client for DB writes
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // ─── Credit check ───
    const isPremiumModel = isExpensiveModel(model);
    const creditResult = await checkAndDeductAnalysisCredits(supabaseAdmin, user.id, model, isPremiumModel);
    if (!creditResult.ok) {
      return new Response(
        JSON.stringify({ error: creditResult.error }),
        { status: creditResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    creditsDeducted = true;
    refundUserId = user.id;

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // 1. Create initial website_profile record with status "pending" (queued)
    // Only pass githubRepoUrl for own website
    const validGithubUrl = (isOwnWebsite && githubRepoUrl && typeof githubRepoUrl === "string" && githubRepoUrl.includes("github.com/"))
      ? githubRepoUrl.trim()
      : null;

    const { data: profile, error: insertError } = await supabaseAdmin
      .from("website_profiles")
      .insert({
        url: formattedUrl,
        conversation_id: conversationId,
        user_id: user.id,
        is_own_website: isOwnWebsite ?? false,
        status: "pending",
        github_repo_url: validGithubUrl,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      // Refund credits since profile creation failed
      await refundCredits(supabaseAdmin, user.id, getAnalysisCreditCost(model), "profile insert failed");
      return new Response(
        JSON.stringify({ error: "Failed to create profile record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileId = profile.id;

    // 2. Insert into analysis_queue
    const { error: queueError } = await supabaseAdmin
      .from("analysis_queue")
      .insert({
        user_id: user.id,
        conversation_id: conversationId,
        url: formattedUrl,
        model,
        is_own_website: isOwnWebsite ?? false,
        profile_id: profileId,
        status: "pending",
        github_repo_url: validGithubUrl,
      });

    if (queueError) {
      console.error("Queue insert error:", queueError);
      // Refund credits since the job never entered the queue
      await refundCredits(supabaseAdmin, user.id, getAnalysisCreditCost(model), "queue insert failed");
      return new Response(
        JSON.stringify({ error: "Failed to queue analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get queue position
    const { count: queueCount, error: positionError } = await supabaseAdmin
      .from("analysis_queue")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("created_at", new Date().toISOString());

    const position = (positionError ? 0 : (queueCount || 0)) + 1;

    console.log(`Analysis queued for ${formattedUrl} (position ${position})`);

    // Fire-and-forget: kick the queue processor immediately
    try {
      const processUrl = `${supabaseUrl}/functions/v1/process-analysis-queue`;
      fetch(processUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({ time: new Date().toISOString() }),
      }).catch((e) => console.warn("Queue kick failed (non-critical):", e));
    } catch (e) {
      console.warn("Queue kick setup failed (non-critical):", e);
    }

    return new Response(
      JSON.stringify({
        success: true,
        profileId,
        queued: true,
        queuePosition: position,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("analyze-website error:", err);
    if (creditsDeducted && refundUserId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        await refundCredits(supabaseAdmin, refundUserId, getAnalysisCreditCost(refundModel), "unexpected error");
      } catch (refundErr) {
        console.error("Refund failed in outer catch:", refundErr);
      }
    }
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});