/**
 * Edge Function: v1-chat-completions
 * =====================================
 * KI-Gateway Proxy — fully featured with Semantic Cache, Smart Routing,
 * Retry Logic and Provider Fallback.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

// ============================================================================
// CRYPTO — AES-256-GCM (identisch mit manage-provider-keys)
// WICHTIG: Diese Funktionen MÜSSEN in beiden Edge Functions gleich sein.
// ============================================================================

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = "synvertas-gateway-v1";

async function deriveCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw", encoder.encode(secret), { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: encoder.encode(PBKDF2_SALT), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
        baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
}
async function decrypt(encryptedRaw: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);
    let base64Input = encryptedRaw;

    // ── Primary path: versioned format set by updated manage-provider-keys ──────
    // New keys are stored as "v1:<base64>". This is 100% unambiguous regardless
    // of DB column type (BYTEA vs TEXT) or PostgREST version.
    if (base64Input.startsWith("v1:")) {
        base64Input = base64Input.slice(3);
    }
    // ── Legacy path 1: Postgres bytea hex format — stored as \x414243... ────────
    // The Supabase PostgREST layer returns BYTEA columns as "\x" + hex digits.
    else if (base64Input.startsWith("\\x")) {
        const hex = base64Input.slice(2);
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
        }
        base64Input = str;
        // After hex decode, check if the result still has the v1: prefix
        if (base64Input.startsWith("v1:")) base64Input = base64Input.slice(3);
    }
    // ── Legacy path 2: PostgREST base64-encoded BYTEA (double-base64) ───────────
    else {
        try {
            const decoded = atob(base64Input.trim());
            // decoded will be the original base64 string if this is double-base64
            if (/^[A-Za-z0-9+/=]+$/.test(decoded) && decoded.length < base64Input.length) {
                base64Input = decoded.startsWith("v1:") ? decoded.slice(3) : decoded;
            }
        } catch {
            // Not valid outer base64, use as-is
        }
    }

    // Normalize URL-safe base64 and fix padding
    let normalized = base64Input.trim().replace(/-/g, "+").replace(/_/g, "/");
    while (normalized.length % 4 !== 0) {
        normalized += "=";
    }

    const combined = Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
}


function getEncryptionSecret(): string {
    const secret = Deno.env.get("GATEWAY_ENCRYPTION_SECRET");
    if (!secret || secret.length < 32) throw new Error("GATEWAY_ENCRYPTION_SECRET is missing or too short.");
    return secret;
}

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const VALID_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

// Fallback order: if a provider fails, try the next one in this list
const FALLBACK_ORDER: Provider[] = ["openai", "anthropic", "google", "mistral"];

// Which HTTP status codes are worth retrying (transient errors)
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-provider, x-gateway-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// ============================================================================
// HELPERS
// ============================================================================

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

class HttpError extends Error {
    constructor(message: string, public readonly status: number) { super(message); }
}

function jsonResponse(body: unknown, status = 200, extra_headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status, headers: { "Content-Type": "application/json", ...corsHeaders, ...extra_headers },
    });
}

/** Sleep helper for retry back-off */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// DATABASE
// ============================================================================

interface GatewaySettings {
    cache_enabled: boolean; cache_similarity: number; cache_ttl_hours: number;
    fallback_enabled: boolean; retry_attempts: number;
    prompt_optimizer_enabled: boolean;
}

const DEFAULT_SETTINGS: GatewaySettings = {
    cache_enabled: true,
    cache_similarity: 0.95,
    cache_ttl_hours: 24,
    fallback_enabled: true,
    retry_attempts: 3,
    prompt_optimizer_enabled: true,
};

// ============================================================================
// PROMPT OPTIMIZER (Llama-4-Scout via Groq)
// ============================================================================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPTIMIZER_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const OPTIMIZER_SYSTEM_PROMPT = `You are an expert Prompt Engineer. Your task is to take a user's prompt and rewrite it to be maximally clear, specific, and well-structured for a large language model.
Rules:
- Preserve the original language and core intention EXACTLY.
- Never change, summarize or remove technical details, code snippets, JSON formats or explicit output instructions.
- Do NOT add explanations, notes, or preambles — return ONLY the improved prompt text.
- If the prompt is already excellent, return it unchanged.`;

async function optimizePrompt(userText: string): Promise<string> {
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) {
        console.warn("[optimizer] GROQ_API_KEY not set, skipping optimization.");
        return userText;
    }
    try {
        const res = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
                model: OPTIMIZER_MODEL,
                messages: [
                    { role: "system", content: OPTIMIZER_SYSTEM_PROMPT },
                    { role: "user", content: userText },
                ],
                max_tokens: 1024,
                temperature: 0.3,
            }),
        });
        if (!res.ok) {
            console.warn(`[optimizer] Groq returned ${res.status}, skipping.`);
            return userText;
        }
        const data = await res.json();
        const improved = data?.choices?.[0]?.message?.content?.trim();
        if (improved && improved.length > 0) {
            console.log("[optimizer] Prompt optimized successfully.");
            return improved;
        }
        return userText;
    } catch (err) {
        console.warn("[optimizer] Failed to optimize prompt:", err);
        return userText;
    }
}

async function resolveUser(admin: SupabaseClient, saasKey: string): Promise<{ userId: string; settings: GatewaySettings }> {
    const { data, error } = await admin.from("gateway_saas_keys").select("user_id")
        .eq("api_key", saasKey).eq("is_active", true).maybeSingle();
    if (error || !data?.user_id) throw new HttpError("Invalid or inactive Synvertas API key.", 401);
    admin.from("gateway_saas_keys").update({ last_used_at: new Date().toISOString() }).eq("api_key", saasKey).then(() => { });
    const { data: s } = await admin.from("gateway_settings").select("*").eq("user_id", data.user_id).maybeSingle();
    return { userId: data.user_id, settings: { ...DEFAULT_SETTINGS, ...(s ?? {}) } };
}

/** Safe version — returns null instead of throwing when key not found */
async function tryResolveProviderKey(admin: SupabaseClient, userId: string, provider: string): Promise<string | null> {
    try {
        const { data, error } = await admin.from("gateway_provider_keys").select("key_encrypted")
            .eq("user_id", userId).eq("provider", provider).eq("is_active", true).maybeSingle();
        if (error || !data?.key_encrypted) return null;
        const secret = getEncryptionSecret();
        const plaintext = await decrypt(data.key_encrypted as string, secret);
        admin.from("gateway_provider_keys").update({ last_used_at: new Date().toISOString() }).eq("user_id", userId).eq("provider", provider).then(() => { });
        return plaintext;
    } catch {
        return null;
    }
}

/** Original version — throws when key not found (used for primary provider) */
async function resolveProviderKey(admin: SupabaseClient, userId: string, provider: string): Promise<string> {
    const key = await tryResolveProviderKey(admin, userId, provider);
    if (!key) throw new HttpError(`No active ${provider} API key found. Please add it in your Synvertas Dashboard.`, 400);
    return key;
}

// ============================================================================
// SEMANTIC CACHE
// ============================================================================

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const hfToken = Deno.env.get("HUGGINGFACE_API_KEY");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;
        const res = await fetch(`https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`, {
            method: "POST", headers, body: JSON.stringify({ inputs: text.slice(0, 512), options: { wait_for_model: true } }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) return data[0] as number[];
        if (Array.isArray(data)) return data as number[];
        return null;
    } catch { return null; }
}

async function checkSemanticCache(admin: SupabaseClient, userId: string, promptContent: string, settings: GatewaySettings, sidecar: { promptHash?: string; embedding?: number[] }) {
    const promptHash = await sha256Hex(promptContent);
    sidecar.promptHash = promptHash;
    const { data: exactRow } = await admin.from("gateway_cache_entries").select("id, response_data, model, provider")
        .eq("user_id", userId).eq("prompt_hash", promptHash)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).maybeSingle();
    if (exactRow) return exactRow;
    const embedding = await generateEmbedding(promptContent);
    if (!embedding) return null;
    sidecar.embedding = embedding;
    const { data: matches, error } = await admin.rpc("match_cache_entries", {
        p_user_id: userId, p_embedding: `[${embedding.join(",")}]`, p_threshold: settings.cache_similarity, p_limit: 1,
    });
    if (!error && matches && matches.length > 0) return { id: matches[0].id, response_data: matches[0].response_data, model: matches[0].model, provider: matches[0].provider };
    return null;
}

function storeCacheEntry(admin: SupabaseClient, userId: string, sidecar: { promptHash?: string; embedding?: number[] }, promptContent: string, responseData: Record<string, unknown>, model: string, provider: string, tokensSaved: number, ttlHours: number) {
    if (!sidecar.promptHash) return;
    const expiresAt = ttlHours > 0 ? new Date(Date.now() + ttlHours * 3_600_000).toISOString() : null;
    admin.from("gateway_cache_entries").insert({
        user_id: userId, prompt_hash: sidecar.promptHash, prompt_text: promptContent.slice(0, 10_000),
        embedding: sidecar.embedding ? `[${sidecar.embedding.join(",")}]` : null, response_data: responseData,
        model, provider, tokens_saved: tokensSaved, hit_count: 0, expires_at: expiresAt,
    }).then(({ error }) => { if (error) console.warn("[cache] Insert failed:", error.message); });
}

// ============================================================================
// PROVIDER ROUTING
// ============================================================================

function buildUpstreamRequest(provider: Provider, providerKey: string, model: string, body: Record<string, unknown>) {
    const baseHeaders: Record<string, string> = { "Content-Type": "application/json" };
    switch (provider) {
        case "openai": return { url: "https://api.openai.com/v1/chat/completions", headers: { ...baseHeaders, "Authorization": `Bearer ${providerKey}` }, body };
        case "mistral": return { url: "https://api.mistral.ai/v1/chat/completions", headers: { ...baseHeaders, "Authorization": `Bearer ${providerKey}` }, body };
        case "google": return { url: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, headers: { ...baseHeaders, "Authorization": `Bearer ${providerKey}` }, body };
        case "anthropic": {
            const messages = (body.messages as Array<{ role: string; content: string }>) ?? [];
            const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
            const userMessages = messages.filter((m) => m.role !== "system");
            return {
                url: "https://api.anthropic.com/v1/messages",
                headers: { ...baseHeaders, "x-api-key": providerKey, "anthropic-version": "2023-06-01" },
                body: { model, max_tokens: (body.max_tokens as number) ?? 1024, system: systemMsg || undefined, messages: userMessages.map((m) => ({ role: m.role, content: m.content })), stream: body.stream },
            };
        }
        default: throw new HttpError(`Unsupported provider: ${provider}`, 400);
    }
}

/**
 * Maps a provider to a sensible default fallback model.
 * When routing fails over to a new provider, we need to pick a compatible model.
 */
function getDefaultModelForProvider(provider: Provider): string {
    switch (provider) {
        case "openai": return "gpt-4o-mini";
        case "anthropic": return "claude-haiku-4-5";
        case "google": return "gemini-2.5-flash";
        case "mistral": return "mistral-small-latest";
    }
}

// ============================================================================
// LOGGING
// ============================================================================

function logRequest(admin: SupabaseClient, m: any) {
    admin.from("gateway_request_logs").insert({
        user_id: m.userId, model_requested: m.requestedModel, model_used: m.finalModel, provider: m.finalProvider,
        latency_ms: m.latencyMs, is_streaming: m.isStreaming, prompt_tokens: m.promptTokens ?? 0,
        completion_tokens: m.compTokens ?? 0, total_tokens: (m.promptTokens ?? 0) + (m.compTokens ?? 0),
        status: m.status, cache_hit: m.cacheHit ?? false, cache_entry_id: m.cacheEntryId ?? null, error_code: m.errorCode ?? null,
    }).then(({ error }) => { if (error) console.error("[log] Failed:", error.message); });
}

// ============================================================================
// CORE FETCH WITH RETRY + FALLBACK
// ============================================================================

interface AttemptResult {
    response: Response;
    provider: Provider;
    model: string;
}

/**
 * Tries fetching from a provider with automatic retries.
 * Returns the successful Response, or null if all retries are exhausted
 * or error is non-retryable.
 */
async function fetchWithRetry(
    admin: SupabaseClient,
    userId: string,
    provider: Provider,
    model: string,
    body: Record<string, unknown>,
    maxAttempts: number,
): Promise<AttemptResult | null> {
    const providerKey = await tryResolveProviderKey(admin, userId, provider);
    if (!providerKey) {
        console.warn(`[gateway] No key for provider '${provider}', skipping.`);
        return null;
    }

    const cfg = buildUpstreamRequest(provider, providerKey, model, { ...body, model });
    let lastStatus = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const upstream = await fetch(cfg.url, {
                method: "POST",
                headers: cfg.headers,
                body: JSON.stringify(cfg.body),
            });

            if (upstream.ok) {
                return { response: upstream, provider, model };
            }

            lastStatus = upstream.status;
            const errText = await upstream.text();
            console.warn(`[gateway] ${provider} attempt ${attempt}/${maxAttempts} failed: HTTP ${upstream.status} — ${errText}`);

            // Non-retryable client errors (bad request, auth failures)
            if (!RETRYABLE_STATUSES.has(upstream.status)) {
                console.warn(`[gateway] Status ${upstream.status} is non-retryable for '${provider}'. Skipping remaining retries.`);
                return null;
            }
        } catch (err) {
            console.warn(`[gateway] ${provider} attempt ${attempt}/${maxAttempts} network error:`, err);
            lastStatus = 0;
        }

        // Exponential back-off: 500ms, 1000ms, 2000ms, ...
        if (attempt < maxAttempts) {
            await sleep(500 * Math.pow(2, attempt - 1));
        }
    }

    console.warn(`[gateway] All ${maxAttempts} attempts for '${provider}' failed (last HTTP status: ${lastStatus}).`);
    return null;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const startTime = Date.now();
    let userId = "", requestedModel = "gpt-4o-mini", finalModel = "gpt-4o-mini", finalProvider: Provider = "openai";

    try {
        const gatewayKeyHeader = req.headers.get("x-gateway-key") ?? "";
        const authHeader = req.headers.get("Authorization") ?? "";
        let saasKey = "";
        if (gatewayKeyHeader.startsWith("sgw_")) saasKey = gatewayKeyHeader.trim();
        else if (authHeader.startsWith("Bearer sgw_")) saasKey = authHeader.slice(7).trim();
        else throw new HttpError("Missing or invalid API key. Expected: x-gateway-key: sgw_... header.", 401);

        const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
        const body = await req.json().catch(() => null);
        if (!body?.messages) throw new HttpError("Invalid request body. Must be OpenAI-compatible JSON.", 400);
        const isStreaming = body.stream === true;
        requestedModel = body.model || "gpt-4o-mini";

        const { userId: uid, settings } = await resolveUser(admin, saasKey);
        userId = uid;
        finalModel = requestedModel;

        // ── Provider Detection ─────────────────────────────────────────────────
        // Respect explicit x-provider header; otherwise auto-detect from model name.
        const explicitProvider = req.headers.get("x-provider");
        if (explicitProvider && VALID_PROVIDERS.includes(explicitProvider as Provider)) {
            finalProvider = explicitProvider as Provider;
        } else {
            const m = requestedModel.toLowerCase();
            if (m.includes("claude")) finalProvider = "anthropic";
            else if (m.includes("gemini")) finalProvider = "google";
            else if (m.includes("mistral") || m.includes("mixtral")) finalProvider = "mistral";
            else finalProvider = "openai"; // Default: OpenAI (gpt-*, o3-*, o4-*, etc.)
        }

        // ── Prompt Optimizer (Llama-4-Scout via Groq) ─────────────────────────
        // Optimizes the last user message before caching and routing.
        // Skipped for streaming requests to avoid extra latency on first token.
        if (settings.prompt_optimizer_enabled && !isStreaming) {
            const messages = body.messages as Array<{ role: string; content: string }>;
            const lastUserIdx = messages.map((m) => m.role).lastIndexOf("user");
            if (lastUserIdx !== -1 && typeof messages[lastUserIdx].content === "string") {
                const original = messages[lastUserIdx].content as string;
                const improved = await optimizePrompt(original);
                if (improved !== original) {
                    body.messages = [
                        ...messages.slice(0, lastUserIdx),
                        { ...messages[lastUserIdx], content: improved },
                        ...messages.slice(lastUserIdx + 1),
                    ];
                }
            }
        }

        const promptContent = JSON.stringify(body.messages);
        const cacheSidecar: { promptHash?: string; embedding?: number[] } = {};

        // ── Semantic Cache Check ───────────────────────────────────────────────
        if (settings.cache_enabled && !isStreaming) {
            try {
                const hit = await checkSemanticCache(admin, userId, promptContent, settings, cacheSidecar);
                if (hit) {
                    const latencyMs = Date.now() - startTime;
                    const cachedBody = typeof hit.response_data === "string" ? JSON.parse(hit.response_data) : hit.response_data;
                    admin.from("gateway_cache_entries").update({ hit_count: (hit as any).hit_count + 1, last_hit_at: new Date().toISOString() }).eq("id", hit.id).then(() => { });
                    logRequest(admin, { userId, requestedModel, finalModel: hit.model, finalProvider: "cache", latencyMs, isStreaming: false, status: "cached", cacheHit: true, cacheEntryId: hit.id });
                    return jsonResponse(cachedBody, 200, { "X-Cache": "HIT", "X-Cache-Type": cacheSidecar.embedding ? "semantic" : "exact" });
                }
            } catch (err) { console.warn("[cache] Cache check failed, continuing:", err); }
        }

        // ── Retry + Fallback Logic ─────────────────────────────────────────────
        //
        // Build an ordered list of providers to try. The primary provider comes first.
        // If fallback is enabled, the remaining providers follow in FALLBACK_ORDER.
        const maxAttempts = Math.max(1, settings.retry_attempts ?? DEFAULT_SETTINGS.retry_attempts);
        const providersToTry: Provider[] = [finalProvider];

        if (settings.fallback_enabled) {
            for (const p of FALLBACK_ORDER) {
                if (p !== finalProvider) providersToTry.push(p);
            }
        }

        let successResult: AttemptResult | null = null;
        let usedProvider = finalProvider;
        let usedModel = finalModel;

        for (const candidate of providersToTry) {
            // For the primary provider, use the smart-routed model.
            // For fallback providers, use their default model (original model may be incompatible).
            const modelForCandidate = candidate === finalProvider
                ? finalModel
                : getDefaultModelForProvider(candidate);

            console.log(`[gateway] Trying provider '${candidate}' with model '${modelForCandidate}' (max ${maxAttempts} attempts)`);

            const result = await fetchWithRetry(admin, userId, candidate, modelForCandidate, body, isStreaming ? 1 : maxAttempts);

            if (result) {
                successResult = result;
                usedProvider = result.provider;
                usedModel = result.model;
                if (candidate !== finalProvider) {
                    console.log(`[gateway] Fallback to '${candidate}' succeeded.`);
                }
                break;
            }
        }

        if (!successResult) {
            throw new HttpError(
                `All providers failed after retries${settings.fallback_enabled ? " and fallbacks" : ""}. Please check your provider API keys and try again.`,
                502
            );
        }

        const latencyMs = Date.now() - startTime;
        const upstream = successResult.response;

        // ── Streaming response ─────────────────────────────────────────────────
        if (isStreaming) {
            const { readable, writable } = new TransformStream();
            upstream.body?.pipeTo(writable);
            logRequest(admin, { userId, requestedModel, finalModel: usedModel, finalProvider: usedProvider, latencyMs, isStreaming: true, status: "success" });
            return new Response(readable, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Cache": "MISS", "X-Provider-Used": usedProvider } });
        }

        // ── Non-streaming response ─────────────────────────────────────────────
        const jsonResp = await upstream.json();
        const promptTokens = jsonResp.usage?.prompt_tokens || 0;
        const compTokens = jsonResp.usage?.completion_tokens || 0;

        if (settings.cache_enabled && cacheSidecar.promptHash) {
            storeCacheEntry(admin, userId, cacheSidecar, promptContent, jsonResp, usedModel, usedProvider, promptTokens + compTokens, settings.cache_ttl_hours);
        }

        logRequest(admin, { userId, requestedModel, finalModel: usedModel, finalProvider: usedProvider, latencyMs, isStreaming: false, promptTokens, compTokens, status: "success", cacheHit: false });
        return jsonResponse(jsonResp, 200, { "X-Cache": "MISS", "X-Provider-Used": usedProvider });

    } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const status = err instanceof HttpError ? err.status : 500;
        const message = err instanceof Error ? err.message : "Internal Gateway Error";
        console.error(`[v1-chat-completions] ${status} ${message}`);
        if (userId) {
            const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
            logRequest(admin, { userId, requestedModel, finalModel, finalProvider, latencyMs, isStreaming: false, status: "error", errorCode: String(status) });
        }
        return jsonResponse({ error: { message, status } }, status);
    }
});
