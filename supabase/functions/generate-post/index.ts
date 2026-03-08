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

const FREE_DAILY_LIMIT = 5;
const PREMIUM_DAILY_LIMIT = 25;

// Credit costs per model (same as chat)
const CREDIT_COSTS: Record<string, number> = {
  "gemini-flash": 3,
  "gpt-mini": 3,
  gpt: 6,
  "claude-sonnet": 6,
  perplexity: 7,
};

const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"];

interface ModelConfig {
  apiModel: string;
  provider: "gemini" | "openai" | "anthropic" | "perplexity";
}

const MODEL_MAP: Record<string, ModelConfig> = {
  "gemini-flash": { apiModel: "gemini-2.5-flash", provider: "gemini" },
  "gpt-mini": { apiModel: "gpt-4o-mini", provider: "openai" },
  gpt: { apiModel: "gpt-4o", provider: "openai" },
  "claude-sonnet": { apiModel: "claude-sonnet-4-20250514", provider: "anthropic" },
  perplexity: { apiModel: "sonar-pro", provider: "perplexity" },
};

const PLATFORM_PROMPTS: Record<string, string> = {
  reddit: `Write a Reddit post/comment. Use casual, authentic tone. No emojis spam. Include a personal angle or story. Don't be salesy — provide genuine value first, mention the product subtly if at all. Structure: hook → context → value → soft CTA.`,
  linkedin: `Write a LinkedIn post. Use professional but engaging tone. Start with a bold hook line. Use short paragraphs with line breaks. Include 3-5 relevant hashtags at the end. Structure: hook → insight/story → takeaway → CTA.`,
  x: `Write a Twitter/X thread (3-7 tweets). First tweet must hook immediately. Use conversational, punchy style. No more than 280 chars per tweet. Number each tweet. End with a CTA tweet.`,
  youtube: `Write a YouTube comment or community post. Be conversational and add value. If it's a comment, be specific about the video topic. If it's a community post, engage with a question or poll idea.`,
  facebook: `Write a Facebook group post. Be community-oriented and conversational. Ask questions to spark discussion. Avoid links in the main post (add in comments). Use a storytelling approach.`,
  discord: `Write a Discord message for a relevant server channel. Be casual, helpful, and brief. Use markdown formatting. Don't be promotional — contribute to the conversation.`,
  tiktok: `Write a TikTok video caption/script hook. Keep it under 150 words. Start with a pattern interrupt. Use trending formats if applicable. Include 3-5 relevant hashtags.`,
  quora: `Write a Quora answer. Be thorough, authoritative, and genuinely helpful. Use headers and bullet points. Cite sources or personal experience. Mention the product only if directly relevant to the question.`,
  forum: `Write a forum post for a niche community. Be respectful of community norms. Provide detailed, helpful content. Establish credibility before any mention of products.`,
  cold_email: `Write a cold outreach email/DM. Subject line must be compelling. Keep it under 100 words. Personalize the opening. Focus on their problem, not your product. Clear, single CTA.`,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Use a professional, authoritative tone. Data-driven and polished.",
  casual: "Use a casual, friendly, conversational tone. Like talking to a friend.",
  provocative: "Use a bold, contrarian, provocative tone. Challenge assumptions. Be edgy but not offensive.",
  educational: "Use an educational, teacher-like tone. Break down complex topics simply.",
};

function getRequiredKey(provider: string): string | null {
  const map: Record<string, string> = {
    gemini: "GEMINI_API_KEY",
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    perplexity: "PERPLEXITY_API_KEY",
  };
  const envName = map[provider];
  if (!envName) return null;
  return Deno.env.get(envName) || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    // Auth – extract user ID from JWT (token is signed by external project with ES256)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let userId: string;
    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(atob(payloadBase64));
      userId = payload.sub;
      if (!userId) throw new Error("No sub claim");
    } catch (e) {
      console.error("JWT decode error:", e);
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { platform, tone, goal, product_context, audience_context, model: modelKey } = await req.json();

    if (!platform || !product_context) {
      return new Response(JSON.stringify({ error: "platform and product_context are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resolvedModel = modelKey || "gemini-flash";
    const config = MODEL_MAP[resolvedModel] || MODEL_MAP["gemini-flash"];
    const creditCost = CREDIT_COSTS[resolvedModel] ?? 3;

    const apiKey = getRequiredKey(config.provider);
    if (!apiKey) {
      return new Response(JSON.stringify({ error: `API key for ${config.provider} not configured` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium model check
    if (EXPENSIVE_MODELS.includes(resolvedModel)) {
      const { data: credits } = await adminClient
        .from("user_credits")
        .select("is_premium")
        .eq("user_id", userId)
        .maybeSingle() as { data: { is_premium: boolean } | null };
      if (!credits?.is_premium) {
        return new Response(JSON.stringify({ error: "premium_model_required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    if (remaining < creditCost) {
      const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
      return new Response(JSON.stringify({ error: `insufficient_credits:${hoursLeft}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Daily feature limit
    const dailyLimit = credits.is_premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
    const { data: usage } = await adminClient
      .from("feature_usage")
      .select("id, used_today, reset_at")
      .eq("user_id", userId)
      .eq("feature", "post_generator")
      .maybeSingle() as { data: { id: string; used_today: number; reset_at: string } | null };

    let currentUsage = 0;
    if (usage) {
      const usageResetAt = new Date(usage.reset_at);
      if (usageResetAt < new Date()) {
        await adminClient
          .from("feature_usage")
          .update({ used_today: 0, reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
          .eq("id", usage.id);
      } else {
        currentUsage = usage.used_today;
      }
    }

    if (currentUsage >= dailyLimit) {
      return new Response(JSON.stringify({ error: `daily_limit_reached:post_generator:${dailyLimit}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build system prompt
    const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.forum;
    const toneInstruction = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.casual;
    const goalInstruction = goal ? `Goal: ${goal}.` : "";

    const systemPrompt = `You are an expert content strategist and copywriter. Generate a high-converting post for the specified platform.

${platformPrompt}

${toneInstruction}
${goalInstruction}

${audience_context ? `Target Audience Context:\n${JSON.stringify(audience_context, null, 2)}\n` : ""}

Product/Service Context:
${product_context}

Important:
- Write ONLY the post content, no meta-commentary
- Make it feel authentic and native to the platform
- Provide genuine value before any promotion
- Adapt length and format to the platform's norms`;

    const userMessage = `Generate a ${platform} post with ${tone || "casual"} tone for this product/service. ${goalInstruction}`;

    // Stream response based on provider
    let aiResponse: Response;

    if (config.provider === "gemini") {
      const geminiContents = [
        { role: "user", parts: [{ text: systemPrompt + "\n\n" + userMessage }] },
      ];
      aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.apiModel}:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
          }),
        }
      );
    } else if (config.provider === "anthropic") {
      aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: config.apiModel,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 4096,
          stream: true,
        }),
      });
    } else {
      // OpenAI or Perplexity (OpenAI-compatible)
      const apiUrl = config.provider === "perplexity"
        ? "https://api.perplexity.ai/chat/completions"
        : "https://api.openai.com/v1/chat/completions";

      const messages = config.provider === "perplexity"
        ? [{ role: "user", content: systemPrompt + "\n\n" + userMessage }]
        : [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }];

      aiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.apiModel,
          messages,
          stream: true,
        }),
      });
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`${config.provider} error:`, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform stream to unified SSE format and collect full content
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body!.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            let idx;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              const line = buffer.slice(0, idx).trim();
              buffer = buffer.slice(idx + 1);
              if (!line.startsWith("data:")) continue;
              const payload = line.replace(/^data:\s*/, "");
              if (payload === "[DONE]") continue;

              try {
                const parsed = JSON.parse(payload);
                let content = "";

                if (config.provider === "gemini") {
                  content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || "";
                } else if (config.provider === "anthropic") {
                  if (parsed.type === "content_block_delta") {
                    content = parsed.delta?.text || "";
                  }
                } else {
                  content = parsed.choices?.[0]?.delta?.content || parsed.choices?.[0]?.message?.content || "";
                }

                if (content) {
                  fullContent += content;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`)
                  );
                }
              } catch {}
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Stream transform error:", e);
        } finally {
          // Save post and deduct credits after stream completes
          try {
            await adminClient.from("generated_posts").insert({
              user_id: userId,
              platform,
              tone: tone || "casual",
              goal: goal || "",
              content: fullContent,
              audience_context: audience_context || null,
              model_used: resolvedModel,
            });

            await adminClient
              .from("user_credits")
              .update({ credits_used: creditsUsed + creditCost })
              .eq("id", credits.id);

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
                  feature: "post_generator",
                  used_today: 1,
                  reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                });
            }
          } catch (e) {
            console.error("Post-stream save error:", e);
          }

          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Service unavailable" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
