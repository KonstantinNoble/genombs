import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * add-github-analysis
 *
 * Adds a GitHub code analysis to an existing website profile.
 * 1. Fetches repo code via fetch-github-repo
 * 2. Runs AI analysis on the code
 * 3. Stores result in website_profiles.code_analysis
 */

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

    const { profileId, githubRepoUrl } = await req.json();

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

    // Check premium status
    const { data: credits } = await supabase
      .from("user_credits")
      .select("is_premium")
      .eq("user_id", user.id)
      .single();

    if (!credits?.is_premium) {
      return new Response(
        JSON.stringify({ error: "Deep Analysis is a premium feature" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting GitHub analysis for profile ${profileId}, repo: ${githubRepoUrl}`);

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

    const aiPrompt = `You are a senior web developer and code quality analyst. Analyze the following source code from the GitHub repository "${repoData.repo}" for the website ${profile.url}.

File tree (first 100 files):
${repoData.fileTree}

Source code of key files:
${codeContext}

Provide a structured JSON analysis with the following fields:
{
  "summary": "Brief overall assessment (2-3 sentences)",
  "techStack": ["list of detected technologies"],
  "codeQuality": {
    "score": 0-100,
    "strengths": ["list"],
    "weaknesses": ["list"]
  },
  "security": {
    "score": 0-100,
    "issues": ["list of potential security concerns"],
    "recommendations": ["list"]
  },
  "performance": {
    "score": 0-100,
    "issues": ["list"],
    "recommendations": ["list"]
  },
  "maintainability": {
    "score": 0-100,
    "issues": ["list"],
    "recommendations": ["list"]
  },
  "seo": {
    "codeIssues": ["SEO-related code issues"],
    "recommendations": ["list"]
  }
}

Return ONLY the JSON object, no markdown formatting.`;

    // 3. Call AI (Gemini)
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: aiPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResp.json();
    const aiText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let codeAnalysis;
    try {
      codeAnalysis = JSON.parse(aiText);
    } catch {
      console.error("Failed to parse AI response as JSON:", aiText.substring(0, 500));
      codeAnalysis = { summary: aiText, parseError: true };
    }

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

    console.log(`GitHub analysis complete for profile ${profileId}`);

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
