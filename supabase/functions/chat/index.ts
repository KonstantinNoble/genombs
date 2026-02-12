import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You help users improve their websites by analyzing their online presence and comparing it with competitors.

You have access to website profiles with scores, strengths, weaknesses, and actual crawled content as background context.

CRITICAL RULES:
- NEVER introduce yourself, state your role, or say things like "As an expert..." or "I've reviewed the profiles" or "I've thoroughly analyzed..."
- Use the data as background context to answer naturally and directly
- Do NOT summarize or repeat the analysis data back to the user unless explicitly asked
- Reference specific details from the crawled content when relevant: quote actual text, mention specific pages, headings, CTAs
- Never give generic advice when you have real data available
- When comparing websites, use concrete metrics and examples
- Format responses with markdown: headers, tables, bullet points, bold text
- Answer in the same language as the user's message.`;

// ─── Credit system constants ───

const EXPENSIVE_MODELS = ["gpt", "claude-sonnet", "perplexity"];
const FREE_MODELS = ["gemini-flash", "gpt-mini"];
const CHAT_CREDIT_COST_CHEAP = 1;
const CHAT_CREDIT_COST_EXPENSIVE = 3;

function isExpensiveModel(modelKey: string): boolean {
  return EXPENSIVE_MODELS.includes(modelKey);
}

// ─── Model config ───

interface ModelConfig {
  apiModel: string;
  provider: "gemini" | "openai" | "anthropic" | "perplexity";
}

const MODEL_MAP: Record<string, ModelConfig> = {
  "gemini-flash": { apiModel: "gemini-2.5-flash", provider: "gemini" },
  "gpt-mini": { apiModel: "gpt-4o-mini", provider: "openai" },
  "gpt": { apiModel: "gpt-4o", provider: "openai" },
  "claude-sonnet": { apiModel: "claude-sonnet-4-20250514", provider: "anthropic" },
  "perplexity": { apiModel: "sonar-pro", provider: "perplexity" },
};

// ─── Provider-specific helpers ───

function getRequiredKey(provider: string): { key: string; envName: string } | null {
  const map: Record<string, string> = {
    gemini: "GEMINI_API_KEY",
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    perplexity: "PERPLEXITY_API_KEY",
  };
  const envName = map[provider];
  if (!envName) return null;
  const key = Deno.env.get(envName);
  if (!key) return null;
  return { key, envName };
}

async function streamGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<Response> {
  const geminiContents: { role: string; parts: { text: string }[] }[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === "assistant" ? "model" : "user";
    if (i === 0 && role === "user") {
      geminiContents.push({
        role: "user",
        parts: [{ text: systemPrompt + "\n\nUser message: " + msg.content }],
      });
    } else {
      geminiContents.push({ role, parts: [{ text: msg.content }] });
    }
  }

  const sanitized: typeof geminiContents = [];
  for (const c of geminiContents) {
    if (sanitized.length > 0 && sanitized[sanitized.length - 1].role === c.role) {
      sanitized[sanitized.length - 1].parts.push(...c.parts);
    } else {
      sanitized.push(c);
    }
  }

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: sanitized,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
      }),
    }
  );
  return resp;
}

function transformGeminiStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`)
                );
              }
            } catch { /* partial */ }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Gemini transform error:", e);
      } finally {
        controller.close();
      }
    },
  });
}

async function streamOpenAICompatible(
  apiUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });
  return resp;
}

async function streamAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<Response> {
  const anthropicMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: anthropicMessages,
      max_tokens: 8192,
      stream: true,
    }),
  });
  return resp;
}

function transformAnthropicStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: parsed.delta.text } }] })}\n\n`)
                );
              }
              if (parsed.type === "message_stop") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            } catch { /* partial */ }
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (e) {
        console.error("Anthropic transform error:", e);
      } finally {
        controller.close();
      }
    },
  });
}

// ─── Credit check helper ───

async function checkAndDeductCredits(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  modelKey: string,
  isPremiumRequired: boolean
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  // Fetch user credits
  const { data: credits, error: creditsError } = await supabaseAdmin
    .from("user_credits")
    .select("id, is_premium, daily_credits_limit, credits_used, credits_reset_at")
    .eq("user_id", userId)
    .single();

  if (creditsError || !credits) {
    return { ok: false, status: 500, error: "Could not load user credits" };
  }

  const userIsPremium = credits.is_premium;

  // Model access check
  if (isPremiumRequired && !userIsPremium) {
    return { ok: false, status: 403, error: "premium_model_required" };
  }

  // Auto-reset credits if period expired
  const resetAt = new Date(credits.credits_reset_at);
  let creditsUsed = credits.credits_used;
  if (resetAt < new Date()) {
    creditsUsed = 0;
    await supabaseAdmin
      .from("user_credits")
      .update({ credits_used: 0, credits_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() })
      .eq("id", credits.id);
  }

  const cost = isExpensiveModel(modelKey) ? CHAT_CREDIT_COST_EXPENSIVE : CHAT_CREDIT_COST_CHEAP;
  const remaining = credits.daily_credits_limit - creditsUsed;

  if (remaining < cost) {
    const hoursLeft = Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60 * 60)));
    return { ok: false, status: 403, error: `insufficient_credits:${hoursLeft}` };
  }

  // Deduct credits
  await supabaseAdmin
    .from("user_credits")
    .update({ credits_used: creditsUsed + cost })
    .eq("id", credits.id);

  return { ok: true };
}

// ─── Main handler ───

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, model: modelKey } = await req.json();

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

    const resolvedModelKey = modelKey || "gemini-flash";
    const config = MODEL_MAP[resolvedModelKey] || MODEL_MAP["gemini-flash"];
    const keyInfo = getRequiredKey(config.provider);
    if (!keyInfo) {
      return new Response(
        JSON.stringify({ error: `API key for ${config.provider} is not configured. Please add the required secret to your Supabase project.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    // ─── Credit check ───
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const isPremiumModel = isExpensiveModel(resolvedModelKey);
    const creditResult = await checkAndDeductCredits(supabaseAdmin, user.id, resolvedModelKey, isPremiumModel);
    if (!creditResult.ok) {
      return new Response(
        JSON.stringify({ error: creditResult.error }),
        { status: creditResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch website profiles for context
    let profileContext = "";
    if (conversationId) {
      const { data: profiles } = await supabaseAuth
        .from("website_profiles")
        .select("url, is_own_website, overall_score, category_scores, profile_data, raw_markdown, status")
        .eq("conversation_id", conversationId)
        .eq("status", "completed");

      if (profiles && profiles.length > 0) {
        profileContext = "\n\n## Available Website Profiles\n\n";
        for (const p of profiles) {
          const label = p.is_own_website ? "OWN WEBSITE" : "COMPETITOR";
          profileContext += `### [${label}] ${p.url}\n`;
          profileContext += `Overall Score: ${p.overall_score}/100\n`;
          profileContext += `Category Scores: ${JSON.stringify(p.category_scores)}\n`;
          profileContext += `Profile: ${JSON.stringify(p.profile_data)}\n`;

          if (p.raw_markdown) {
            const trimmed = p.raw_markdown.slice(0, 6000);
            profileContext += `\nCrawled Content:\n${trimmed}\n`;
          }
          profileContext += "\n";
        }
      }
    }

    const fullSystemPrompt = SYSTEM_PROMPT + profileContext;

    // Route to provider
    let providerResp: Response;

    if (config.provider === "gemini") {
      providerResp = await streamGemini(keyInfo.key, config.apiModel, fullSystemPrompt, messages);
    } else if (config.provider === "openai") {
      providerResp = await streamOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        keyInfo.key,
        config.apiModel,
        fullSystemPrompt,
        messages
      );
    } else if (config.provider === "anthropic") {
      providerResp = await streamAnthropic(keyInfo.key, config.apiModel, fullSystemPrompt, messages);
    } else if (config.provider === "perplexity") {
      providerResp = await streamOpenAICompatible(
        "https://api.perplexity.ai/chat/completions",
        keyInfo.key,
        config.apiModel,
        fullSystemPrompt,
        messages
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!providerResp.ok) {
      const errText = await providerResp.text();
      console.error(`${config.provider} error:`, providerResp.status, errText);

      if (providerResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI service error (${config.provider})` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform or passthrough
    let outputStream: ReadableStream<Uint8Array>;

    if (config.provider === "gemini") {
      outputStream = transformGeminiStream(providerResp.body!);
    } else if (config.provider === "anthropic") {
      outputStream = transformAnthropicStream(providerResp.body!);
    } else {
      outputStream = providerResp.body!;
    }

    return new Response(outputStream, {
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
