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

If SOURCE CODE data is provided (from a GitHub repository), also evaluate and add a "codeAnalysis" key with this exact structure:
{
  "codeAnalysis": {
    "summary": "Brief overall assessment of the codebase (2-3 sentences focusing on the most critical findings)",
    "techStack": ["detected technologies and frameworks"],
    "codeQuality": {
      "score": 0-100,
      "strengths": ["specific positive findings with file references where applicable"],
      "weaknesses": ["specific issues with file references where applicable"]
    },
    "security": {
      "score": 0-100,
      "issues": ["specific security concerns found in the code"],
      "recommendations": ["actionable fixes for each issue"]
    },
    "performance": {
      "score": 0-100,
      "issues": ["specific performance anti-patterns found"],
      "recommendations": ["concrete optimization suggestions"]
    },
    "accessibility": {
      "score": 0-100,
      "issues": ["specific accessibility problems found in the code"],
      "recommendations": ["actionable accessibility improvements"]
    },
    "maintainability": {
      "score": 0-100,
      "issues": ["specific maintainability concerns"],
      "recommendations": ["concrete refactoring suggestions"]
    },
    "seo": {
      "score": 0-100,
      "codeIssues": ["SEO-related code issues found"],
      "recommendations": ["specific SEO improvements to implement in code"]
    }
  }
}
Pay special attention to Security, Performance, Accessibility, Maintainability, and SEO - each MUST have a realistic score between 0-100.
Only include "codeAnalysis" if source code data is present in the input.

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
  // 1. Direct parse
  try {
    return JSON.parse(text);
  } catch { /* continue */ }

  // 2. Markdown code block
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch { /* continue */ }
  }

  // 3. Extract first { ... last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.substring(firstBrace, lastBrace + 1));
    } catch { /* continue */ }
  }

  console.error("Failed to parse AI response. First 500 chars:", text.substring(0, 500));
  throw new Error("Could not parse AI response as JSON");
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
      const errorBody = await resp.text();
      console.warn(`PageSpeed API error ${resp.status} for ${url}:`, errorBody);
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

// ─── Code Analysis Validation ───

function validateCodeAnalysis(raw: unknown): Record<string, unknown> {
  const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const clamp = (v: unknown, fallback = 50): number => {
    const n = Number(v);
    return isNaN(n) ? fallback : Math.max(0, Math.min(100, Math.round(n)));
  };
  const ensureArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((i) => typeof i === "string") : [];
  const ensureSub = (o: unknown) => {
    const s = (typeof o === "object" && o !== null ? o : {}) as Record<string, unknown>;
    return {
      score: clamp(s.score),
      issues: ensureArr(s.issues),
      recommendations: ensureArr(s.recommendations),
    };
  };

  const cq = (typeof obj.codeQuality === "object" && obj.codeQuality !== null
    ? obj.codeQuality
    : {}) as Record<string, unknown>;

  return {
    summary: typeof obj.summary === "string" ? obj.summary : "",
    techStack: ensureArr(obj.techStack),
    codeQuality: {
      score: clamp(cq.score ?? obj.codeQuality),
      strengths: ensureArr(cq.strengths),
      weaknesses: ensureArr(cq.weaknesses),
    },
    security: ensureSub(obj.security),
    performance: ensureSub(obj.performance),
    accessibility: ensureSub(obj.accessibility),
    maintainability: ensureSub(obj.maintainability),
    seo: {
      score: clamp((obj.seo as Record<string, unknown>)?.score),
      codeIssues: ensureArr(
        (obj.seo as Record<string, unknown>)?.codeIssues ??
        (obj.seo as Record<string, unknown>)?.issues
      ),
      recommendations: ensureArr((obj.seo as Record<string, unknown>)?.recommendations),
    },
    strengths: ensureArr(obj.strengths ?? cq.strengths),
    weaknesses: ensureArr(obj.weaknesses ?? cq.weaknesses),
    securityIssues: ensureArr(
      obj.securityIssues ?? (obj.security as Record<string, unknown>)?.issues
    ),
    recommendations: ensureArr(obj.recommendations),
  };
}

// ─── Credit refund helper ───

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

// ─── Queue Processing ───

async function processQueue() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

  if (!firecrawlKey) {
    throw new Error("FIRECRAWL_API_KEY not configured");
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Mark jobs stuck for 5+ minutes as error and refund credits
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  // Fetch timed-out jobs first so we can refund credits
  const { data: timedOutJobs } = await supabaseAdmin
    .from("analysis_queue")
    .select("id, user_id, model")
    .eq("status", "processing")
    .lt("started_at", fiveMinutesAgo);

  if (timedOutJobs && timedOutJobs.length > 0) {
    await supabaseAdmin
      .from("analysis_queue")
      .update({ status: "error", error_message: "Job timeout (5+ minutes)" })
      .eq("status", "processing")
      .lt("started_at", fiveMinutesAgo);

    // No credit refund needed — credits are only deducted on success
  }

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

  // 4. Process jobs in parallel using Promise.allSettled
  const jobPromises = nextJobs.map(async (job) => {
    try {
      // Mark as processing
      await supabaseAdmin
        .from("analysis_queue")
        .update({ status: "processing", started_at: new Date().toISOString() })
        .eq("id", job.id);

      console.log(`Processing job ${job.id} for URL: ${job.url}`);

      // Start Firecrawl, PageSpeed, AND GitHub fetch in parallel
      const pagespeedApiKey = Deno.env.get("PAGESPEED_GOOGLE");
      const pagespeedPromise = pagespeedApiKey
        ? fetchPageSpeedData(job.url, pagespeedApiKey)
        : Promise.resolve(null);

      const crawlController = new AbortController();
      const crawlAbortTimeout = setTimeout(() => crawlController.abort(), 120000);

      const crawlPromise = fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: job.url,
          formats: ["markdown", "rawHtml", "links", "screenshot"],
          onlyMainContent: false,
          waitFor: 8000,
          timeout: 90000,
        }),
        signal: crawlController.signal,
      }).finally(() => clearTimeout(crawlAbortTimeout));

      // Fetch GitHub repo code if URL is provided (for own websites only)
      const githubRepoUrl = job.github_repo_url;
      const githubPromise = githubRepoUrl
        ? (async () => {
          try {
            const ghResp = await fetch(`${supabaseUrl}/functions/v1/fetch-github-repo`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ repoUrl: githubRepoUrl }),
            });
            if (!ghResp.ok) {
              console.warn("GitHub fetch failed:", await ghResp.text());
              return null;
            }
            const ghData = await ghResp.json();
            return ghData.success ? ghData.data : null;
          } catch (err) {
            console.warn("GitHub fetch error (non-blocking):", err);
            return null;
          }
        })()
        : Promise.resolve(null);

      const [crawlResp, pagespeedData, githubData] = await Promise.all([crawlPromise, pagespeedPromise, githubPromise]);

      const crawlData = await crawlResp.json();

      let finalCrawlData = crawlData;
      let finalCrawlOk = crawlResp.ok;

      // Retry on SCRAPE_TIMEOUT with reduced formats and onlyMainContent
      if (!crawlResp.ok && crawlData.code === "SCRAPE_TIMEOUT") {
        console.warn(`SCRAPE_TIMEOUT for job ${job.id}, retrying with onlyMainContent...`);
        try {
          const retryController = new AbortController();
          const retryTimeout = setTimeout(() => retryController.abort(), 120000);
          const retryResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${firecrawlKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: job.url,
              formats: ["markdown", "links"],
              onlyMainContent: true,
              waitFor: 8000,
              timeout: 90000,
            }),
            signal: retryController.signal,
          }).finally(() => clearTimeout(retryTimeout));
          const retryData = await retryResp.json();
          if (retryResp.ok) {
            console.log(`Retry succeeded for job ${job.id}`);
            finalCrawlData = retryData;
            finalCrawlOk = true;
          } else {
            console.error(`Retry also failed for job ${job.id}`, retryData);
          }
        } catch (retryErr) {
          console.error(`Retry fetch error for job ${job.id}:`, retryErr);
        }
      }

      if (!finalCrawlOk) {
        console.error("Firecrawl error for job", job.id, finalCrawlData);
        const rawError = finalCrawlData.error || "Crawl failed";
        const userMessage = rawError.toLowerCase().includes("timeout")
          ? "The website took too long to load. Please try again or check if the site is accessible."
          : rawError;

        await supabaseAdmin
          .from("analysis_queue")
          .update({
            status: "error",
            error_message: userMessage,
            completed_at: new Date().toISOString(),
          })
          .eq("id", job.id);

        await supabaseAdmin
          .from("website_profiles")
          .update({
            status: "error",
            error_message: userMessage,
          })
          .eq("id", job.profile_id);

        // No credit refund needed — credits were never deducted

        return;
      }

      const markdown = finalCrawlData.data?.markdown || finalCrawlData.markdown || "";
      const html = finalCrawlData.data?.rawHtml || finalCrawlData.rawHtml || "";
      const screenshotBase64 = finalCrawlData.data?.screenshot || finalCrawlData.screenshot || "";
      const crawlLinks = finalCrawlData.data?.links || finalCrawlData.links || [];

      // Update website_profile status to crawling
      await supabaseAdmin
        .from("website_profiles")
        .update({
          status: "crawling",
          raw_markdown: markdown.substring(0, 50000),
        })
        .eq("id", job.profile_id);

      // Store screenshot as fire-and-forget (non-blocking)
      if (screenshotBase64) {
        try {
          const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");
          const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

          supabaseAdmin.storage
            .from("website-screenshots")
            .upload(`${job.user_id}/${job.profile_id}.png`, binaryData, {
              contentType: "image/png",
              upsert: true,
            })
            .then(({ error: storageErr }) => {
              if (storageErr) console.warn("Screenshot storage failed (non-critical):", storageErr);
            })
            .catch((err) => console.warn("Screenshot storage failed (non-critical):", err));
        } catch (screenshotErr) {
          console.warn("Screenshot decode failed (non-critical):", screenshotErr);
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

      // Append PageSpeed data if available
      if (pagespeedData) {
        console.log("PageSpeed data received:", JSON.stringify(pagespeedData));
        const cwv = pagespeedData.coreWebVitals;
        enrichedContent += `\n\n=== GOOGLE PAGESPEED DATA (objective, verified by Google) ===\nPerformance: ${pagespeedData.performance}/100\nAccessibility: ${pagespeedData.accessibility}/100\nBest Practices: ${pagespeedData.bestPractices}/100\nSEO: ${pagespeedData.seo}/100\nCore Web Vitals: LCP=${cwv.lcp ? (cwv.lcp / 1000).toFixed(1) + "s" : "N/A"}, CLS=${cwv.cls?.toFixed(3) ?? "N/A"}, FCP=${cwv.fcp ? (cwv.fcp / 1000).toFixed(1) + "s" : "N/A"}, TBT=${cwv.tbt ? Math.round(cwv.tbt) + "ms" : "N/A"}`;
      } else if (pagespeedApiKey) {
        console.warn("PageSpeed returned null for URL:", job.url);
      } else {
        console.warn("PAGESPEED_GOOGLE secret NOT FOUND -- skipping PageSpeed");
      }

      // Append GitHub source code data if available
      if (githubData) {
        console.log(`GitHub data: ${githubData.fetchedFiles} files, ${githubData.totalChars} chars from ${githubData.repo}`);
        enrichedContent += `\n\n=== SOURCE CODE ANALYSIS (from GitHub: ${githubData.repo}) ===`;
        enrichedContent += `\nRepository: ${githubData.repo}`;
        enrichedContent += `\nTotal relevant files: ${githubData.totalRelevantFiles}`;
        enrichedContent += `\n\n--- File Tree ---\n${githubData.fileTree}`;
        for (const file of githubData.files) {
          enrichedContent += `\n\n--- ${file.path} ---\n${file.content}`;
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

      if (pagespeedData) {
        updatePayload.pagespeed_data = pagespeedData;
      }

      // Store code analysis results if GitHub data was used
      if (githubData && analysisResult.codeAnalysis) {
        updatePayload.code_analysis = validateCodeAnalysis(analysisResult.codeAnalysis);
      }

      await supabaseAdmin
        .from("website_profiles")
        .update(updatePayload)
        .eq("id", job.profile_id);

      // --- Score History Snapshot (non-blocking, own website only, with dedup) ---
      if (job.is_own_website) {
        let snapshotHostname = job.url;
        try {
          snapshotHostname = new URL(job.url).hostname.replace(/^www\./, "");
        } catch { /* keep raw url */ }

        // Dedup: skip if a snapshot for this user+url was created in the last 2 minutes
        const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
        const { data: recentSnap } = await supabaseAdmin
          .from("analysis_snapshots")
          .select("id")
          .eq("user_id", job.user_id)
          .eq("url", job.url)
          .gte("scanned_at", twoMinAgo)
          .limit(1);

        if (recentSnap && recentSnap.length > 0) {
          console.log(`Snapshot dedup: skipping duplicate for ${snapshotHostname}`);
        } else {
          supabaseAdmin
            .from("analysis_snapshots")
            .insert({
              user_id: job.user_id,
              url: job.url,
              hostname: snapshotHostname,
              overall_score: analysisResult.overallScore,
              category_scores: analysisResult.categoryScores,
            })
            .then(({ error: snapErr }) => {
              if (snapErr) console.warn("Snapshot insert failed (non-critical):", snapErr);
              else console.log(`Score snapshot saved for ${snapshotHostname}`);
            });
        }
      }

      // Mark queue job as completed
      await supabaseAdmin
        .from("analysis_queue")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      console.log(`Job ${job.id} completed successfully`);

      // Deduct credits only on successful completion
      const cost = getAnalysisCreditCost(job.model);
      try {
        const { data: creditData } = await supabaseAdmin
          .from("user_credits")
          .select("id, credits_used")
          .eq("user_id", job.user_id)
          .single();

        if (creditData) {
          await supabaseAdmin
            .from("user_credits")
            .update({ credits_used: (creditData.credits_used ?? 0) + cost })
            .eq("id", creditData.id);
          console.log(`Credits deducted: ${cost} for user ${job.user_id}`);
        }
      } catch (creditErr) {
        console.error("Credit deduction failed (non-blocking):", creditErr);
      }
    } catch (err) {
      console.error(`Error processing job ${job.id}:`, err);
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const errorMsg = isAbort
        ? "The website took too long to load. Please try again or check if the site is accessible."
        : err instanceof Error ? err.message : String(err);

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

      // No credit refund needed — credits were never deducted
    }
  });

  await Promise.allSettled(jobPromises);
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
