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
 * 1. Scrapes the given URL via Firecrawl (markdown + screenshot)
 * 2. Sends the markdown to Gemini to produce a structured website profile
 * 3. Stores the result in `website_profiles`
 *
 * Required secrets on the Supabase project:
 *   FIRECRAWL_API_KEY, GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const GEMINI_SYSTEM_PROMPT = `You are an expert website analyst. Analyze the provided website content and return a JSON object with exactly this structure:

{
  "name": "Company/website name",
  "targetAudience": "Description of the target audience",
  "usp": "Unique selling proposition",
  "ctas": ["CTA 1", "CTA 2"],
  "siteStructure": ["Page 1", "Page 2"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
}

Also provide category scores (0-100) for:
- findability: How easy is it to find via search engines? (SEO, meta tags, structured data)
- mobileUsability: Mobile responsiveness and usability
- offerClarity: How clear is the value proposition and offer?
- trustProof: Trust signals like reviews, certifications, testimonials
- conversionReadiness: CTAs, booking forms, contact options

Return the complete result as:
{
  "profileData": { ... the profile object above ... },
  "categoryScores": { "findability": N, "mobileUsability": N, "offerClarity": N, "trustProof": N, "conversionReadiness": N },
  "overallScore": N
}

Respond ONLY with valid JSON, no markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, conversationId, isOwnWebsite } = await req.json();

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
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
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

    // 2. Crawl with Firecrawl
    console.log("Scraping URL:", formattedUrl);
    let markdown = "";
    let screenshotBase64 = "";

    try {
      const crawlResp = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          formats: ["markdown", "screenshot"],
          onlyMainContent: true,
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
      screenshotBase64 = crawlData.data?.screenshot || crawlData.screenshot || "";
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
        // Remove data:image/... prefix if present
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

    // 4. Analyze with Gemini
    console.log("Analyzing with Gemini...");
    try {
      const truncatedMarkdown = markdown.substring(0, 30000);

      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: GEMINI_SYSTEM_PROMPT },
                  { text: `Website URL: ${formattedUrl}\n\nWebsite Content:\n${truncatedMarkdown}` },
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

      const geminiData = await geminiResp.json();

      if (!geminiResp.ok) {
        console.error("Gemini error:", geminiData);
        await supabaseAdmin
          .from("website_profiles")
          .update({ status: "error", error_message: "AI analysis failed" })
          .eq("id", profileId);
        return new Response(
          JSON.stringify({ error: "AI analysis failed", profileId }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract JSON from Gemini response
      const responseText =
        geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      let analysisResult;
      try {
        analysisResult = JSON.parse(responseText);
      } catch {
        // Try to extract JSON from markdown code block
        const jsonMatch = responseText.match(/```json?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("Could not parse Gemini response as JSON");
        }
      }

      // 5. Update website_profile with results
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
      console.error("Gemini exception:", aiErr);
      await supabaseAdmin
        .from("website_profiles")
        .update({ status: "error", error_message: String(aiErr) })
        .eq("id", profileId);
      return new Response(
        JSON.stringify({ error: "AI analysis exception", profileId }),
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
