import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * chat
 *
 * Streaming chat endpoint using Gemini.
 * Automatically includes website profile context from the conversation.
 *
 * Required secrets: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 */

const SYSTEM_PROMPT = `You are an expert website & marketing analyst at Synoptas. You help users improve their websites by analyzing their online presence and comparing it with competitors.

You have access to structured website profiles that were created by analyzing websites. Use this data to provide specific, actionable advice.

When comparing websites, use concrete metrics and examples from the profile data. Format your responses with markdown: use headers, tables, bullet points, and bold text for clarity.

Always be constructive and specific. Instead of generic advice, reference the actual data from the website profiles.

Answer in the same language as the user's message.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch website profiles for context (if conversationId provided)
    let profileContext = "";
    if (conversationId) {
      const { data: profiles } = await supabaseAuth
        .from("website_profiles")
        .select("url, is_own_website, overall_score, category_scores, profile_data, status")
        .eq("conversation_id", conversationId)
        .eq("status", "completed");

      if (profiles && profiles.length > 0) {
        profileContext = "\n\n## Available Website Profiles\n\n";
        for (const p of profiles) {
          const label = p.is_own_website ? "OWN WEBSITE" : "COMPETITOR";
          profileContext += `### [${label}] ${p.url}\n`;
          profileContext += `Overall Score: ${p.overall_score}/100\n`;
          profileContext += `Category Scores: ${JSON.stringify(p.category_scores)}\n`;
          profileContext += `Profile: ${JSON.stringify(p.profile_data)}\n\n`;
        }
      }
    }

    // Build Gemini messages
    const geminiContents = [];

    // System + context as first user message (Gemini doesn't have system role in v1beta)
    const systemMessage = SYSTEM_PROMPT + profileContext;

    // Convert chat messages to Gemini format
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === "assistant" ? "model" : "user";
      
      // Prepend system prompt to first user message
      if (i === 0 && role === "user") {
        geminiContents.push({
          role: "user",
          parts: [{ text: systemMessage + "\n\nUser message: " + msg.content }],
        });
      } else {
        geminiContents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Ensure alternating roles (Gemini requirement)
    const sanitizedContents = [];
    for (let i = 0; i < geminiContents.length; i++) {
      if (i > 0 && geminiContents[i].role === geminiContents[i - 1].role) {
        // Merge consecutive same-role messages
        sanitizedContents[sanitizedContents.length - 1].parts.push(
          ...geminiContents[i].parts
        );
      } else {
        sanitizedContents.push(geminiContents[i]);
      }
    }

    // Stream from Gemini
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: sanitizedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      console.error("Gemini streaming error:", geminiResp.status, errText);

      if (geminiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini SSE stream to OpenAI-compatible SSE format
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        const reader = geminiResp.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIdx;
          while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIdx).trim();
            buffer = buffer.slice(newlineIdx + 1);

            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                // Emit OpenAI-compatible SSE
                const chunk = {
                  choices: [{ delta: { content: text } }],
                };
                await writer.write(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              }
            } catch {
              // partial JSON, skip
            }
          }
        }

        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        console.error("Stream transform error:", err);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("chat error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
