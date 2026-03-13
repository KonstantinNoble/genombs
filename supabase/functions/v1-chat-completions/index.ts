/**
 * Edge Function: v1-chat-completions
 * =====================================
 * KI-Gateway Proxy — vollständig mit Semantic Cache.
 *
 * Pipeline für jeden Request:
 *   1. Auth   → sgw_... Key → user_id
 *   2. Smart Routing → welches Modell/Provider?
 *   3. Semantic Cache Check (pgvector Cosine Similarity)
 *      → HIT:  Antwort direkt zurück, $0 Kosten
 *      → MISS: weiter zu Schritt 4
 *   4. Provider Key entschlüsseln (AES-256-GCM) via _shared
 *   5. Request an OpenAI/Anthropic/Google/Mistral forwarden
 *   6. Antwort an Cache speichern (retroaktiv)
 *   7. Streaming-Antwort oder JSON zurückschicken
 *   8. Metriken loggen (tokens, kosten, latenz, cache status)
 *
 * Embeddings: Hugging Face Inference API (kostenlos, kein User-Key nötig)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { encrypt, decrypt, getEncryptionSecret } from "../_shared/crypto.ts";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const VALID_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-provider, x-gateway-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Hugging Face model for embeddings (free, no user key needed)
// 384-dimensional — NOTE: requires schema to use vector(384) not vector(1536)
const HF_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2";

// ============================================================================
// 1. CRYPTO UTILS — now via _shared/crypto.ts
// ============================================================================

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// 2. HUGGING FACE EMBEDDINGS (Free, no user key required)
// ============================================================================

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const hfToken = Deno.env.get("HUGGINGFACE_API_KEY");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (hfToken) headers["Authorization"] = `Bearer ${hfToken}`;

        const res = await fetch(
            `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_EMBEDDING_MODEL}`,
            {
                method: "POST",
                headers,
                body: JSON.stringify({
                    inputs: text.slice(0, 512),
                    options: { wait_for_model: true },
                }),
            },
        );

        if (!res.ok) {
            console.warn(`[embed] HuggingFace API error ${res.status} — skipping semantic cache.`);
            return null;
        }

        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) return data[0] as number[];
        if (Array.isArray(data)) return data as number[];
        return null;
    } catch (err) {
        console.warn("[embed] Embedding generation failed:", err);
        return null;
    }
}

// ============================================================================
// 3. DATABASE HELPERS
// ============================================================================

interface GatewaySettings {
    cache_enabled: boolean;
    cache_similarity: number;
    cache_ttl_hours: number;
    smart_routing_enabled: boolean;
    short_query_threshold: number;
    short_query_model: string;
    long_query_model: string;
    fallback_enabled: boolean;
}

const DEFAULT_SETTINGS: GatewaySettings = {
    cache_enabled: true,
    cache_similarity: 0.95,
    cache_ttl_hours: 24,
    smart_routing_enabled: true,
    short_query_threshold: 100,
    short_query_model: "gpt-4o-mini",
    long_query_model: "gpt-4o",
    fallback_enabled: true,
};

/** Resolve sgw_... key → user_id + gateway settings */
async function resolveUser(
    admin: SupabaseClient,
    saasKey: string,
): Promise<{ userId: string; settings: GatewaySettings }> {
    const { data, error } = await admin
        .from("gateway_saas_keys")
        .select("user_id")
        .eq("api_key", saasKey)
        .eq("is_active", true)
        .maybeSingle();

    if (error || !data?.user_id) {
        throw new HttpError("Invalid or inactive Synvertas API key.", 401);
    }

    // fire-and-forget last_used
    admin.from("gateway_saas_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("api_key", saasKey).then(() => { });

    const { data: s } = await admin
        .from("gateway_settings")
        .select("*")
        .eq("user_id", data.user_id)
        .maybeSingle();

    return { userId: data.user_id, settings: { ...DEFAULT_SETTINGS, ...(s ?? {}) } };
}

/** Fetch + decrypt provider key from vault using shared crypto */
async function resolveProviderKey(
    admin: SupabaseClient,
    userId: string,
    provider: string,
): Promise<string> {
    const { data, error } = await admin
        .from("gateway_provider_keys")
        .select("key_encrypted")
        .eq("user_id", userId)
        .eq("provider", provider)
        .eq("is_active", true)
        .maybeSingle();

    if (error || !data?.key_encrypted) {
        throw new HttpError(
            `No active ${provider} API key found. Please add it in your Synvertas Dashboard.`,
            400,
        );
    }

    const secret = getEncryptionSecret();
    const plaintext = await decrypt(data.key_encrypted as string, secret);

    admin.from("gateway_provider_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("provider", provider).then(() => { });

    return plaintext;
}

// ============================================================================
// 4. SEMANTIC CACHE (Provider-Agnostic via Hugging Face)
// ============================================================================

interface CacheHitResult {
    id: string;
    response_data: Record<string, unknown>;
    model: string;
    provider: string;
}

async function checkSemanticCache(
    admin: SupabaseClient,
    userId: string,
    promptContent: string,
    settings: GatewaySettings,
    sidecar: { promptHash?: string; embedding?: number[] },
): Promise<CacheHitResult | null> {

    const promptHash = await sha256Hex(promptContent);
    sidecar.promptHash = promptHash;

    const { data: exactRow } = await admin
        .from("gateway_cache_entries")
        .select("id, response_data, model, provider")
        .eq("user_id", userId)
        .eq("prompt_hash", promptHash)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .maybeSingle();

    if (exactRow) return exactRow as CacheHitResult;

    const embedding = await generateEmbedding(promptContent);
    if (!embedding) return null;

    sidecar.embedding = embedding;

    const { data: matches, error: matchError } = await admin.rpc("match_cache_entries", {
        p_user_id: userId,
        p_embedding: `[${embedding.join(",")}]`,
        p_threshold: settings.cache_similarity,
        p_limit: 1,
    });

    if (matchError) {
        console.warn("[cache] pgvector match error:", matchError.message);
        return null;
    }

    if (matches && matches.length > 0) {
        return {
            id: matches[0].id,
            response_data: matches[0].response_data,
            model: matches[0].model,
            provider: matches[0].provider,
        };
    }

    return null;
}

function storeCacheEntry(
    admin: SupabaseClient,
    userId: string,
    sidecar: { promptHash?: string; embedding?: number[] },
    promptContent: string,
    responseData: Record<string, unknown>,
    model: string,
    provider: string,
    tokensSaved: number,
    ttlHours: number,
) {
    if (!sidecar.promptHash) return;

    const expiresAt = ttlHours > 0
        ? new Date(Date.now() + ttlHours * 3_600_000).toISOString()
        : null;

    admin.from("gateway_cache_entries").insert({
        user_id: userId,
        prompt_hash: sidecar.promptHash,
        prompt_text: promptContent.slice(0, 10_000),
        embedding: sidecar.embedding ? `[${sidecar.embedding.join(",")}]` : null,
        response_data: responseData,
        model,
        provider,
        tokens_saved: tokensSaved,
        hit_count: 0,
        expires_at: expiresAt,
    }).then(({ error }) => {
        if (error) console.warn("[cache] Insert failed:", error.message);
    });
}

// ============================================================================
// 5. PROVIDER ROUTING
// ============================================================================

interface UpstreamConfig {
    url: string;
    headers: Record<string, string>;
    body: unknown;
}

function buildUpstreamRequest(
    provider: Provider,
    providerKey: string,
    model: string,
    body: Record<string, unknown>,
): UpstreamConfig {
    const baseHeaders: Record<string, string> = { "Content-Type": "application/json" };

    switch (provider) {
        case "openai":
            return {
                url: "https://api.openai.com/v1/chat/completions",
                headers: { ...baseHeaders, "Authorization": `Bearer ${providerKey}` },
                body,
            };

        case "anthropic": {
            const messages = (body.messages as Array<{ role: string; content: string }>) ?? [];
            const systemMsg = messages.find((m) => m.role === "system")?.content ?? "";
            const userMessages = messages.filter((m) => m.role !== "system");

            return {
                url: "https://api.anthropic.com/v1/messages",
                headers: {
                    ...baseHeaders,
                    "x-api-key": providerKey,
                    "anthropic-version": "2023-06-01",
                },
                body: {
                    model,
                    max_tokens: (body.max_tokens as number) ?? 1024,
                    system: systemMsg || undefined,
                    messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
                    stream: body.stream,
                },
            };
        }

        case "google":
            return {
                url: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
                headers: {
                    ...baseHeaders,
                    "Authorization": `Bearer ${providerKey}`,
                },
                body,
            };

        case "mistral":
            return {
                url: "https://api.mistral.ai/v1/chat/completions",
                headers: { ...baseHeaders, "Authorization": `Bearer ${providerKey}` },
                body,
            };

        default:
            throw new HttpError(`Unsupported provider: ${provider}`, 400);
    }
}

// ============================================================================
// 6. LOGGING
// ============================================================================

interface LogMetrics {
    userId: string;
    requestedModel: string;
    finalModel: string;
    finalProvider: string;
    latencyMs: number;
    isStreaming: boolean;
    promptTokens?: number;
    compTokens?: number;
    status: "success" | "error" | "cached" | "rate_limited" | "fallback";
    cacheHit?: boolean;
    cacheEntryId?: string | null;
    errorCode?: string;
}

function logRequest(admin: SupabaseClient, m: LogMetrics) {
    admin.from("gateway_request_logs").insert({
        user_id: m.userId,
        model_requested: m.requestedModel,
        model_used: m.finalModel,
        provider: m.finalProvider,
        latency_ms: m.latencyMs,
        is_streaming: m.isStreaming,
        prompt_tokens: m.promptTokens ?? 0,
        completion_tokens: m.compTokens ?? 0,
        total_tokens: (m.promptTokens ?? 0) + (m.compTokens ?? 0),
        status: m.status,
        cache_hit: m.cacheHit ?? false,
        cache_entry_id: m.cacheEntryId ?? null,
        error_code: m.errorCode ?? null,
    }).then(({ error }) => {
        if (error) console.error("[log] Failed:", error.message);
    });
}

// ============================================================================
// 7. HELPERS
// ============================================================================

class HttpError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
    }
}

function jsonResponse(body: unknown, status = 200, extra_headers: Record<string, string> = {}): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders, ...extra_headers },
    });
}

// ============================================================================
// 8. MAIN HANDLER
// ============================================================================

serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const startTime = Date.now();
    let userId = "";
    let requestedModel = "gpt-4o-mini";
    let finalModel = "gpt-4o-mini";
    let finalProvider: Provider = "openai";

    try {
        // ── Auth ─────────────────────────────────────────────────────────────────
        const gatewayKeyHeader = req.headers.get("x-gateway-key") ?? "";
        const authHeader = req.headers.get("Authorization") ?? "";

        let saasKey = "";
        if (gatewayKeyHeader.startsWith("sgw_")) {
            saasKey = gatewayKeyHeader.trim();
        } else if (authHeader.startsWith("Bearer sgw_")) {
            saasKey = authHeader.slice(7).trim();
        } else {
            throw new HttpError("Missing or invalid API key. Expected: x-gateway-key: sgw_... header.", 401);
        }

        // ── Bootstrap Supabase Admin Client ──────────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

        // ── Parse body ────────────────────────────────────────────────────────────
        const body = await req.json().catch(() => null);
        if (!body?.messages) {
            throw new HttpError("Invalid request body. Must be OpenAI-compatible JSON.", 400);
        }
        const isStreaming = body.stream === true;
        requestedModel = body.model || "gpt-4o-mini";

        // ── Resolve User + Settings ───────────────────────────────────────────────
        const { userId: uid, settings } = await resolveUser(admin, saasKey);
        userId = uid;

        // ── Smart Routing ─────────────────────────────────────────────────────────
        finalModel = requestedModel;
        finalProvider = (req.headers.get("x-provider") || "openai") as Provider;

        if (settings.smart_routing_enabled) {
            const tokenEstimate = JSON.stringify(body.messages).length / 4;
            finalModel = tokenEstimate < settings.short_query_threshold
                ? settings.short_query_model
                : settings.long_query_model;

            if (finalModel.includes("claude")) finalProvider = "anthropic";
            else if (finalModel.includes("gpt")) finalProvider = "openai";
            else if (finalModel.includes("gemini")) finalProvider = "google";
            else if (finalModel.includes("mistral") || finalModel.includes("mixtral")) finalProvider = "mistral";
            body.model = finalModel;
        }

        // ── Semantic Cache Check ──────────────────────────────────────────────────
        const promptContent = JSON.stringify(body.messages);
        const cacheSidecar: { promptHash?: string; embedding?: number[] } = {};

        if (settings.cache_enabled && !isStreaming) {
            try {
                const hit = await checkSemanticCache(admin, userId, promptContent, settings, cacheSidecar);

                if (hit) {
                    const latencyMs = Date.now() - startTime;
                    const cachedBody = typeof hit.response_data === "string"
                        ? JSON.parse(hit.response_data)
                        : hit.response_data;

                    admin.from("gateway_cache_entries")
                        .update({ hit_count: (hit as any).hit_count + 1, last_hit_at: new Date().toISOString() })
                        .eq("id", hit.id).then(() => { });

                    const cacheType = cacheSidecar.embedding ? "semantic" : "exact";
                    logRequest(admin, {
                        userId, requestedModel, finalModel: hit.model, finalProvider: "cache",
                        latencyMs, isStreaming: false, status: "cached", cacheHit: true, cacheEntryId: hit.id,
                    });

                    return jsonResponse(cachedBody, 200, { "X-Cache": "HIT", "X-Cache-Type": cacheType });
                }
            } catch (err) {
                console.warn("[cache] Cache check failed, continuing:", err);
            }
        }

        // ── Decrypt Provider Key via _shared/crypto ───────────────────────────────
        const providerKey = await resolveProviderKey(admin, userId, finalProvider);

        // ── Build and Send Upstream Request ───────────────────────────────────────
        const upstream_cfg = buildUpstreamRequest(finalProvider, providerKey, finalModel, body);

        const upstream = await fetch(upstream_cfg.url, {
            method: "POST",
            headers: upstream_cfg.headers,
            body: JSON.stringify(upstream_cfg.body),
        });

        if (!upstream.ok) {
            const errText = await upstream.text();
            throw new HttpError(
                `Upstream '${finalProvider}' returned error ${upstream.status}: ${errText}`,
                upstream.status,
            );
        }

        const latencyMs = Date.now() - startTime;

        // ── Streaming Response ─────────────────────────────────────────────────────
        if (isStreaming) {
            const { readable, writable } = new TransformStream();
            upstream.body?.pipeTo(writable);

            logRequest(admin, { userId, requestedModel, finalModel, finalProvider, latencyMs, isStreaming: true, status: "success" });

            return new Response(readable, {
                headers: {
                    ...corsHeaders,
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Cache": "MISS",
                },
            });
        }

        // ── JSON Response + Retroactive Cache Store ───────────────────────────────
        const jsonResp = await upstream.json();
        const promptTokens = jsonResp.usage?.prompt_tokens || 0;
        const compTokens = jsonResp.usage?.completion_tokens || 0;

        if (settings.cache_enabled && cacheSidecar.promptHash) {
            storeCacheEntry(
                admin, userId, cacheSidecar, promptContent, jsonResp,
                finalModel, finalProvider, promptTokens + compTokens, settings.cache_ttl_hours,
            );
        }

        logRequest(admin, {
            userId, requestedModel, finalModel, finalProvider, latencyMs,
            isStreaming: false, promptTokens, compTokens, status: "success", cacheHit: false,
        });

        return jsonResponse(jsonResp, 200, { "X-Cache": "MISS" });

    } catch (err: unknown) {
        const latencyMs = Date.now() - startTime;
        const status = err instanceof HttpError ? err.status : 500;
        const message = err instanceof Error ? err.message : "Internal Gateway Error";
        console.error(`[v1-chat-completions] ${status} ${message}`);

        if (userId) {
            const admin = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
                { auth: { persistSession: false } },
            );
            logRequest(admin, {
                userId, requestedModel, finalModel, finalProvider, latencyMs,
                isStreaming: false, status: "error", errorCode: String(status),
            });
        }

        return jsonResponse({ error: { message, status } }, status);
    }
});
