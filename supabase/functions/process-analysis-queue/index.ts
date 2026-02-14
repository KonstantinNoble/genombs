import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * process-analysis-queue
 *
 * Worker function that processes analysis requests from the queue.
 * - Runs every 30 seconds via pg_cron
 * - Processes max 3 concurrent jobs to prevent overload
 * - Premium users get priority
 * - Jobs stuck for 5+ minutes are marked as error
 * - Contains all the analysis logic previously in analyze-website
 */

// ─── SEO Data Extraction (same as analyze-website) ───

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

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  const canonicalMatch = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*?)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  const jsonLd: string[] = [];
  const jsonLdRegex = /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
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
    const truncated = seo.jsonLd.slice(0, 3);
    sections.push(`Structured Data (JSON-LD): ${truncated.length} block(s) found`);
    for (const ld of truncated) {
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

If Google PageSpeed data is provided in the context, use it to anchor your scores:
- findability: Weight Google's SEO score heavily (within +/-10 points of Google's value)
- mobileUsability: Factor in Performance score and Core Web Vitals (LCP < 2.5s = good, > 4s = poor)
- Reference these objective metrics in the strengths/weaknesses where relevant

IMPORTANT: When technical data shows "MISSING", reflect this proportionally in the scores and mention it in weaknesses. Missing elements are real weaknesses even if some may be injected dynamically. Score based on what is actually verifiable in the provided data.

Respond ONLY with valid JSON, no markdown, no explanation.`;

// ─── Analysis functions ───

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
    const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error("Could not parse AI response as JSON");
  }
}

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

// ─── PageSpeed Insights ───

interface PageSpeedResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: {
    lcp: number | null;
    cls: number | null;
    fcp: number | null;
    tbt: number | null;
    speedIndex: number | null;
  };
}

async function fetchPageSpeedData(url: string, apiKey: string): Promise<PageSpeedResult | null> {
  try {
    const params = new URLSearchParams({
      url,
      strategy: "mobile",
      category: "performance",
      key: apiKey,
    });
    // Add remaining categories
    params.append("category", "accessibility");
    params.append("category", "best-practices");
    params.append("category", "seo");

    const resp = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`);
    if (!resp.ok) {
      console.warn(`PageSpeed API returned ${resp.status} for ${url}`);
      return null;
    }

    const data = await resp.json();
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    return {
      performance: Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((cats.seo?.score ?? 0) * 100),
      coreWebVitals: {
        lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
        cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
        fcp: audits["first-contentful-paint"]?.numericValue ?? null,
        tbt: audits["total-blocking-time"]?.numericValue ?? null,
        speedIndex: audits["speed-index"]?.numericValue ?? null,
      },
    };
  } catch (err) {
    console.warn("PageSpeed fetch failed (non-blocking):", err);
    return null;
  }
}

// ─── Queue Processing ───

async function processQueue() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

  if (!firecrawlKey) {
    throw new Error("FIRECRAWL_API_KEY not configured");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Mark jobs stuck for 5+ minutes as error
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await supabaseAdmin
    .from("analysis_queue")
    .update({ status: "error", error_message: "Job timeout (5+ minutes)" })
    .eq("status", "processing")
    .lt("started_at", fiveMinutesAgo);

  // 2. Count current processing jobs
  const { count: processingCount, error: countError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "processing");

  if (countError) {
    console.error("Error counting processing jobs:", countError);
    return;
  }
  const maxConcurrent = 3;
  const slotsAvailable = Math.max(0, maxConcurrent - processingCount);

  if (slotsAvailable === 0) {
    console.log("Max concurrent jobs reached, waiting for next cycle");
    return;
  }

  // 3. Fetch pending jobs (ordered by priority DESC, created_at ASC)
  const { data: nextJobs, error: fetchError } = await supabaseAdmin
    .from("analysis_queue")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(slotsAvailable);

  if (fetchError || !nextJobs || nextJobs.length === 0) {
    console.log("No pending jobs found");
    return;
  }

  console.log(`Processing ${nextJobs.length} job(s) from queue`);

  // 4. Process each job
  for (const job of nextJobs) {
    try {
      // Mark as processing
      await supabaseAdmin
        .from("analysis_queue")
        .update({ status: "processing", started_at: new Date().toISOString() })
        .eq("id", job.id);

      console.log(`Processing job ${job.id} for URL: ${job.url}`);

      // Crawl with Firecrawl
      const crawlResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: job.url,
          formats: ["markdown", "rawHtml", "links", "screenshot"],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      });

      const crawlData = await crawlResp.json();

      if (!crawlResp.ok) {
        console.error("Firecrawl error for job", job.id, crawlData);
        await supabaseAdmin
          .from("analysis_queue")
          .update({
            status: "error",
            error_message: crawlData.error || "Crawl failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        await supabaseAdmin
          .from("website_profiles")
          .update({
            status: "error",
            error_message: crawlData.error || "Crawl failed",
          })
          .eq("id", job.profile_id);

        continue;
      }

      const markdown = crawlData.data?.markdown || crawlData.markdown || "";
      const html = crawlData.data?.rawHtml || crawlData.rawHtml || "";
      const screenshotBase64 = crawlData.data?.screenshot || crawlData.screenshot || "";
      const crawlLinks = crawlData.data?.links || crawlData.links || [];

      // Update website_profile status to crawling
      await supabaseAdmin
        .from("website_profiles")
        .update({
          status: "crawling",
          raw_markdown: markdown.substring(0, 50000),
        })
        .eq("id", job.profile_id);

      // Store screenshot if available
      if (screenshotBase64) {
        try {
          const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
          const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

          await supabaseAdmin.storage
            .from("website-screenshots")
            .upload(`${job.user_id}/${job.profile_id}.png`, binaryData, {
              contentType: "image/png",
              upsert: true,
            });
        } catch (storageErr) {
          console.warn("Screenshot storage failed (non-critical):", storageErr);
        }
      }

      // Extract SEO data and build context
      const seoData = extractSEOData(html);

      let hostname = "";
      try {
        hostname = new URL(job.url).hostname || "";
      } catch {
        // ignore
      }

      const internalLinks = crawlLinks.filter((l: string) => {
        try {
          return new URL(l).hostname === hostname;
        } catch {
          return false;
        }
      }).length;
      const externalLinks = crawlLinks.length - internalLinks;

      const truncatedMarkdown = markdown.substring(0, 30000);
      let enrichedContent = buildEnrichedContext(
        job.url,
        truncatedMarkdown,
        seoData,
        { internal: internalLinks, external: externalLinks }
      );

      // Fetch PageSpeed data (non-blocking)
      const pagespeedApiKey = Deno.env.get("PAGESPEED_GOOGLE");
      let pagespeedData: PageSpeedResult | null = null;
      if (pagespeedApiKey) {
        pagespeedData = await fetchPageSpeedData(job.url, pagespeedApiKey);
        if (pagespeedData) {
          const cwv = pagespeedData.coreWebVitals;
          enrichedContent += `\n\n=== GOOGLE PAGESPEED DATA (objective, verified by Google) ===\nPerformance: ${pagespeedData.performance}/100\nAccessibility: ${pagespeedData.accessibility}/100\nBest Practices: ${pagespeedData.bestPractices}/100\nSEO: ${pagespeedData.seo}/100\nCore Web Vitals: LCP=${cwv.lcp ? (cwv.lcp / 1000).toFixed(1) + "s" : "N/A"}, CLS=${cwv.cls?.toFixed(3) ?? "N/A"}, FCP=${cwv.fcp ? (cwv.fcp / 1000).toFixed(1) + "s" : "N/A"}, TBT=${cwv.tbt ? Math.round(cwv.tbt) + "ms" : "N/A"}`;
        }
      }

      // Update status to analyzing
      await supabaseAdmin
        .from("website_profiles")
        .update({ status: "analyzing" })
        .eq("id", job.profile_id);

      // Analyze with AI
      console.log(`Analyzing with model: ${job.model}...`);
      const analysisResult = (await routeAnalysis(
        job.model as ModelId,
        enrichedContent
      )) as Record<string, unknown>;

      // Update website_profile with results
      const updatePayload: Record<string, unknown> = {
        status: "completed",
        profile_data: analysisResult.profileData,
        category_scores: analysisResult.categoryScores,
        overall_score: analysisResult.overallScore,
        error_message: null,
      };

      // Add pagespeed_data if column exists (graceful fallback)
      if (pagespeedData) {
        updatePayload.pagespeed_data = pagespeedData;
      }

      await supabaseAdmin
        .from("website_profiles")
        .update(updatePayload)
        .eq("id", job.profile_id);

      // Mark queue job as completed
      await supabaseAdmin
        .from("analysis_queue")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      console.log(`Job ${job.id} completed successfully`);
    } catch (err) {
      console.error(`Error processing job ${job.id}:`, err);
      const errorMsg = err instanceof Error ? err.message : String(err);

      await supabaseAdmin
        .from("analysis_queue")
        .update({
          status: "error",
          error_message: errorMsg,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      await supabaseAdmin
        .from("website_profiles")
        .update({
          status: "error",
          error_message: errorMsg,
        })
        .eq("id", job.profile_id);
    }
  }
}

// ─── Main handler ───

serve(async (req) => {
  // This endpoint is called by pg_cron, no auth needed
  if (req.method === "POST") {
    try {
      await processQueue();
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Queue processor error:", err);
      return new Response(JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
