import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Improved Code Analysis Prompt ───

function buildCodeAnalysisPrompt(repoName: string, websiteUrl: string, fileTree: string, codeContext: string): string {
  return `You are a senior full-stack developer and code auditor.
Analyze the source code from the GitHub repository "${repoName}" which powers the website ${websiteUrl}.

Evaluate the code in the context of the LIVE website it serves.

File tree (first 100 files):
${fileTree}

Source code of key files:
${codeContext}

Pay special attention to:
- **Framework best practices**: Detect the framework (React, Next.js, Vue, Angular, Svelte, etc.) and evaluate adherence to its conventions (component structure, state management, routing patterns, SSR/SSG usage).
- **Security vulnerabilities**: Exposed API keys or secrets in client code, XSS attack vectors, CSRF protection, SQL injection risks, insecure authentication patterns, missing input validation, unsafe use of dangerouslySetInnerHTML or equivalent.
- **Performance anti-patterns**: Unnecessary re-renders, missing React.memo/useMemo/useCallback where beneficial, missing lazy loading (routes, images, components), large bundle imports (importing entire libraries instead of tree-shaking), unoptimized images, missing code splitting.
- **Accessibility compliance**: ARIA attributes usage, semantic HTML elements (nav, main, article, section, aside, header, footer), keyboard navigation support, color contrast considerations in code, alt attributes on images, form label associations.
- **SEO implementation quality**: Meta tags management, structured data (JSON-LD), SSR/SSG for crawlability, canonical URLs, Open Graph tags, sitemap generation, robots.txt configuration, proper heading hierarchy (single H1).
- **Code maintainability**: Component organization and size, TypeScript type safety, error handling and error boundaries, consistent naming conventions, DRY principles, separation of concerns, test coverage indicators.
- **Dependency health**: Outdated major versions in package.json, known vulnerable packages, unnecessary dependencies, dependency count.

Return a structured JSON analysis with exactly this format:
{
  "summary": "Brief overall assessment of the codebase (2-3 sentences focusing on the most critical findings)",
  "techStack": ["list of detected technologies and frameworks"],
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
    "codeIssues": ["SEO-related code issues found"],
    "recommendations": ["specific SEO improvements to implement in code"]
  }
}

Return ONLY the JSON object, no markdown formatting.`;
}

// ─── Model Router (mirrors process-analysis-queue) ───

type ModelId = "gemini-flash" | "gpt-mini" | "gpt" | "claude-sonnet" | "perplexity";

function parseJsonResponse(text: string): unknown {
  try { return JSON.parse(text); } catch { /* continue */ }
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) { try { return JSON.parse(jsonMatch[1]); } catch { /* continue */ } }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch { /* continue */ }
  }
  console.error("Failed to parse AI response. First 500 chars:", text.substring(0, 500));
  throw new Error("Could not parse AI response as JSON");
}

async function analyzeWithGemini(prompt: string, apiKey: string): Promise<unknown> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8192, responseMimeType: "application/json" },
      }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) { console.error("Gemini error:", data); throw new Error(`Gemini API error: ${resp.status}`); }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return parseJsonResponse(text);
}

async function analyzeWithOpenAI(prompt: string, apiKey: string, modelName: string): Promise<unknown> {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 8192,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) { console.error("OpenAI error:", data); throw new Error(`OpenAI API error: ${resp.status}`); }
  const text = data.choices?.[0]?.message?.content || "";
  return parseJsonResponse(text);
}

async function analyzeWithAnthropic(prompt: string, apiKey: string): Promise<unknown> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) { console.error("Anthropic error:", data); throw new Error(`Anthropic API error: ${resp.status}`); }
  const text = data.content?.[0]?.text || "";
  return parseJsonResponse(text);
}

async function analyzeWithPerplexity(prompt: string, apiKey: string): Promise<unknown> {
  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 8192,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) { console.error("Perplexity error:", data); throw new Error(`Perplexity API error: ${resp.status}`); }
  const text = data.choices?.[0]?.message?.content || "";
  return parseJsonResponse(text);
}

async function routeAnalysis(model: ModelId, prompt: string): Promise<unknown> {
  switch (model) {
    case "gemini-flash": {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) throw new Error("GEMINI_API_KEY not configured");
      return analyzeWithGemini(prompt, key);
    }
    case "gpt-mini": {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) throw new Error("OPENAI_API_KEY not configured");
      return analyzeWithOpenAI(prompt, key, "gpt-4o-mini");
    }
    case "gpt": {
      const key = Deno.env.get("OPENAI_API_KEY");
      if (!key) throw new Error("OPENAI_API_KEY not configured");
      return analyzeWithOpenAI(prompt, key, "gpt-4o");
    }
    case "claude-sonnet": {
      const key = Deno.env.get("ANTHROPIC_API_KEY");
      if (!key) throw new Error("ANTHROPIC_API_KEY not configured");
      return analyzeWithAnthropic(prompt, key);
    }
    case "perplexity": {
      const key = Deno.env.get("PERPLEXITY_API_KEY");
      if (!key) throw new Error("PERPLEXITY_API_KEY not configured");
      return analyzeWithPerplexity(prompt, key);
    }
    default: {
      const key = Deno.env.get("GEMINI_API_KEY");
      if (!key) throw new Error("GEMINI_API_KEY not configured");
      return analyzeWithGemini(prompt, key);
    }
  }
}

// ─── Main Handler ───

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { profileId, githubRepoUrl, model } = await req.json();

    if (!profileId || !githubRepoUrl) {
      return new Response(
        JSON.stringify({ error: "profileId and githubRepoUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify profile belongs to user
    const { data: profile, error: profileError } = await supabase
      .from("website_profiles")
      .select("id, user_id, url, status")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: profile does not belong to you" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credit check
    const CODE_ANALYSIS_COSTS: Record<string, number> = {
      "gemini-flash": 8,
      "gpt-mini": 8,
      "gpt": 12,
      "claude-sonnet": 12,
      "perplexity": 15,
    };

    const { data: credits } = await supabase
      .from("user_credits")
      .select("credits_used, daily_credits_limit")
      .eq("user_id", user.id)
      .single();

    const creditsUsed = credits?.credits_used ?? 0;
    const creditsLimit = credits?.daily_credits_limit ?? 20;
    const remaining = creditsLimit - creditsUsed;
    const selectedModel: ModelId = (model as ModelId) || "gemini-flash";
    const cost = CODE_ANALYSIS_COSTS[selectedModel] ?? 8;

    if (remaining < cost) {
      return new Response(
        JSON.stringify({ error: `Not enough credits. Need ${cost}, have ${remaining}.` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting GitHub analysis for profile ${profileId}, repo: ${githubRepoUrl}, model: ${selectedModel}`);

    // 1. Fetch GitHub repo code
    const fetchRepoResp = await fetch(`${supabaseUrl}/functions/v1/fetch-github-repo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({ repoUrl: githubRepoUrl }),
    });

    const repoResult = await fetchRepoResp.json();
    if (!repoResult.success) {
      return new Response(
        JSON.stringify({ error: `GitHub fetch failed: ${repoResult.error}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const repoData = repoResult.data;

    // 2. Build code context for AI
    const codeContext = repoData.files
      .map((f: { path: string; content: string }) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n");

    const aiPrompt = buildCodeAnalysisPrompt(repoData.repo, profile.url, repoData.fileTree, codeContext);

    // 3. Call AI via model router
    const codeAnalysis = await routeAnalysis(selectedModel, aiPrompt);

    // 4. Save to profile
    const { error: updateError } = await supabase
      .from("website_profiles")
      .update({
        code_analysis: codeAnalysis,
        github_repo_url: githubRepoUrl,
      })
      .eq("id", profileId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Deduct credits
    await supabase
      .from("user_credits")
      .update({ credits_used: creditsUsed + cost, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    console.log(`GitHub analysis complete for profile ${profileId} using model ${selectedModel}, deducted ${cost} credits`);

    return new Response(
      JSON.stringify({ success: true, codeAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("add-github-analysis error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
