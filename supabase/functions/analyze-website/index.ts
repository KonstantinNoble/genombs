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
  sections.push(`Viewport Meta: ${seo.viewport ? `"${seo.viewport}"` : "MISSING (likely not mobile-responsive)"}`);
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
- If any of these are MISSING, lower the score and mention it explicitly.

**mobileUsability**: Check the viewport meta tag:
- If viewport meta is MISSING, score should be significantly lower (max 40) and state this.
- If viewport is present ("width=device-width, initial-scale=1"), that's a positive signal.
- Also assess content structure (headings, readability, content length).

**offerClarity**: How clear is the value proposition and offer based on the content?

**trustProof**: Trust signals like reviews, certifications, testimonials, about page, team info.

**conversionReadiness**: CTAs, booking forms, contact options, clear next steps.

IMPORTANT: When technical data shows "MISSING", explicitly mention this in weaknesses and reflect it in scores. Do NOT guess or assume data exists if it's marked as MISSING.

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, conversationId, isOwnWebsite, model = "gemini-flash" } = await req.json();

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

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // 1. Create initial website_profile record with status "crawling"
    const { data: profile, error: insertError } = await supabaseAdmin
      .from("website_profiles")
      .insert({
        url: formattedUrl,
        conversation_id: conversationId,
        user_id: user.id,
        is_own_website: isOwnWebsite ?? false,
        status: "crawling",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create profile record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileId = profile.id;

    // 2. Crawl with Firecrawl – now requesting html + links for SEO analysis
    console.log("Scraping URL:", formattedUrl);
    let markdown = "";
    let html = "";
    let screenshotBase64 = "";
    let crawlLinks: string[] = [];

    try {
      const crawlResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ["markdown", "rawHtml", "links", "screenshot"],
          onlyMainContent: false, // We need full HTML for meta tags
          waitFor: 3000,
        }),
      });

      const crawlData = await crawlResp.json();

      if (!crawlResp.ok) {
        console.error("Firecrawl error:", crawlData);
        await supabaseAdmin
          .from("website_profiles")
          .update({ status: "error", error_message: crawlData.error || "Crawl failed" })
          .eq("id", profileId);
        return new Response(
          JSON.stringify({ error: "Crawl failed", profileId }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      markdown = crawlData.data?.markdown || crawlData.markdown || "";
      html = crawlData.data?.rawHtml || crawlData.rawHtml || "";
      screenshotBase64 = crawlData.data?.screenshot || crawlData.screenshot || "";
      crawlLinks = crawlData.data?.links || crawlData.links || [];
    } catch (crawlErr) {
      console.error("Firecrawl exception:", crawlErr);
      await supabaseAdmin
        .from("website_profiles")
        .update({ status: "error", error_message: String(crawlErr) })
        .eq("id", profileId);
      return new Response(
        JSON.stringify({ error: "Crawl exception", profileId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to "analyzing"
    await supabaseAdmin
      .from("website_profiles")
      .update({ status: "analyzing", raw_markdown: markdown.substring(0, 50000) })
      .eq("id", profileId);

    // 3. Optionally store screenshot in Supabase Storage
    if (screenshotBase64) {
      try {
        const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        await supabaseAdmin.storage
          .from("website-screenshots")
          .upload(`${user.id}/${profileId}.png`, binaryData, {
            contentType: "image/png",
            upsert: true,
          });
      } catch (storageErr) {
        console.warn("Screenshot storage failed (non-critical):", storageErr);
      }
    }

    // 4. Extract SEO data from HTML and build enriched context
    const seoData = extractSEOData(html);

    // Count internal vs external links
    let hostname = "";
    try {
      hostname = new URL(formattedUrl).hostname;
    } catch { /* ignore */ }

    const internalLinks = crawlLinks.filter((l: string) => {
      try { return new URL(l).hostname === hostname; } catch { return false; }
    }).length;
    const externalLinks = crawlLinks.length - internalLinks;

    console.log(`SEO data: title=${!!seoData.title}, viewport=${!!seoData.viewport}, jsonLd=${seoData.jsonLd.length}, links=${crawlLinks.length}`);

    const truncatedMarkdown = markdown.substring(0, 30000);
    const enrichedContent = buildEnrichedContext(
      formattedUrl,
      truncatedMarkdown,
      seoData,
      { internal: internalLinks, external: externalLinks }
    );

    // 5. Analyze with selected AI model
    console.log(`Analyzing with model: ${model}...`);
    try {
      const analysisResult = await routeAnalysis(model as ModelId, enrichedContent) as Record<string, unknown>;

      // 6. Update website_profile with results
      await supabaseAdmin
        .from("website_profiles")
        .update({
          status: "completed",
          profile_data: analysisResult.profileData,
          category_scores: analysisResult.categoryScores,
          overall_score: analysisResult.overallScore,
          error_message: null,
        })
        .eq("id", profileId);

      console.log("Analysis complete for", formattedUrl);

      return new Response(
        JSON.stringify({
          success: true,
          profileId,
          overallScore: analysisResult.overallScore,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (aiErr) {
      console.error("AI analysis exception:", aiErr);
      await supabaseAdmin
        .from("website_profiles")
        .update({ status: "error", error_message: String(aiErr) })
        .eq("id", profileId);
      return new Response(
        JSON.stringify({ error: String(aiErr), profileId }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("analyze-website error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});