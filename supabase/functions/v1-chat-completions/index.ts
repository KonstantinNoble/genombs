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
 *   4. Provider Key entschlüsseln (AES-256-GCM)
 *   5. Request an OpenAI/Anthropic forwarden
 *   6. Antwort an Cache speichern (retroaktiv)
 *   7. Streaming-Antwort oder JSON zurückschicken
 *   8. Metriken loggen (tokens, kosten, latenz, cache status)
 *
 * Alles in einer Datei gebündelt für manuelles Deployment.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const VALID_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type, x-provider",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ============================================================================
// 1. CRYPTO UTILS (AES-256-GCM — Web Crypto API, kein npm nötig)
// ============================================================================

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = "synvertas-gateway-v1";

async function deriveCryptoKey(secret: string): Promise<CryptoKey> {
    const raw = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: new TextEncoder().encode(PBKDF2_SALT), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
        raw,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"],
    );
}

async function decrypt(encryptedBase64: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);
    const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: combined.slice(0, 12) },
        key,
        combined.slice(12),
    );
    return new TextDecoder().decode(plaintext);
}

async function sha256Hex(input: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// 2. DATABASE HELPERS
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

/** Fetch + decrypt provider key from vault */
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

    const secret = Deno.env.get("GATEWAY_ENCRYPTION_SECRET");
    if (!secret || secret.length < 32) {
        throw new Error("GATEWAY_ENCRYPTION_SECRET is misconfigured on the server.");
    }

    const plaintext = await decrypt(data.key_encrypted as string, secret);

    admin.from("gateway_provider_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("provider", provider).then(() => { });

    return plaintext;
}

// ============================================================================
// 3. SEMANTIC CACHE
// ============================================================================

interface CacheHitResult {
    id: string;
    response_data: Record<string, unknown>;
    model: string;
    provider: string;
}

/**
 * Check the semantic cache for this user's prompt.
 * First tries an exact SHA-256 hash match (nanoseconds), then falls back
 * to pgvector cosine-similarity search (milliseconds).
 *
 * Returns null if no suitable cached response is found.
 * As a side effect, attaches the generated embedding to `sidecar` for
 * later storage if the cache misses.
 */
async function checkSemanticCache(
    admin: SupabaseClient,
    userId: string,
    promptContent: string,
    settings: GatewaySettings,
    openAIEmbedKey: string,
    sidecar: { promptHash?: string; embedding?: number[] },
): Promise<CacheHitResult | null> {

    // ── Step A: Exact hash match (free, instant) ──────────────────────────────
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

    // ── Step B: Semantic similarity via pgvector ──────────────────────────────
    // Generate an embedding using text-embedding-3-small
    const embedRes = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAIEmbedKey}`,
        },
        body: JSON.stringify({ input: promptContent, model: "text-embedding-3-small" }),
    });

    if (!embedRes.ok) {
        // Embedding generation failed — skip cache, proceed to provider
        console.warn(`[cache] Embedding API error ${embedRes.status} — skipping cache.`);
        return null;
    }

    const embedJson = await embedRes.json();
    const embedding: number[] = embedJson.data[0].embedding;
    sidecar.embedding = embedding; // store for later cache insertion

    // Call the match_cache_entries() Postgres function (defined in schema)
    const { data: matches, error: matchError } = await admin.rpc("match_cache_entries", {
        p_user_id: userId,
        p_embedding: `[${embedding.join(",")}]`, // Postgres vector literal
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

    return null; // genuine cache miss
}

/**
 * Persist a successful LLM response to the semantic cache.
 * Called fire-and-forget — does NOT block the HTTP response.
 */
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
    if (!sidecar.promptHash || !sidecar.embedding) return; // nothing to cache

    const expiresAt = ttlHours > 0
        ? new Date(Date.now() + ttlHours * 3_600_000).toISOString()
        : null;

    admin.from("gateway_cache_entries").insert({
        user_id: userId,
        prompt_hash: sidecar.promptHash,
        prompt_text: promptContent.slice(0, 10_000),
        embedding: `[${sidecar.embedding.join(",")}]`, // Postgres vector literal
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
// 4. LOGGING
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
// 5. HELPERS
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
// 6. MAIN HANDLER
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
        const authHeader = req.headers.get("Authorization") ?? "";
        if (!authHeader.startsWith("Bearer sgw_")) {
            throw new HttpError("Missing or invalid API key. Expected: Authorization: Bearer sgw_...", 401);
        }
        const saasKey = authHeader.slice(7).trim();

        // ── Bootstrap Supabase Admin Client (service role, bypasses RLS) ─────────
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
            body.model = finalModel;
        }

        // ── Semantic Cache Check ──────────────────────────────────────────────────
        const promptContent = JSON.stringify(body.messages);
        const cacheSidecar: { promptHash?: string; embedding?: number[] } = {};

        if (settings.cache_enabled && !isStreaming) {
            // For embedding generation, we need an OpenAI key.
            // We try the user's own OpenAI key which we resolve below — but first we
            // attempt the cheaper exact-hash path without needing the key at all.
            const exactHash = await sha256Hex(promptContent);
            cacheSidecar.promptHash = exactHash;

            const { data: exactRow } = await admin
                .from("gateway_cache_entries")
                .select("id, response_data, model, provider")
                .eq("user_id", userId)
                .eq("prompt_hash", exactHash)
                .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
                .maybeSingle();

            if (exactRow) {
                // Exact cache hit — return immediately (no API call, $0)
                const latencyMs = Date.now() - startTime;
                const cachedBody = typeof exactRow.response_data === "string"
                    ? JSON.parse(exactRow.response_data)
                    : exactRow.response_data;

                // Update hit count (fire-and-forget)
                admin.from("gateway_cache_entries")
                    .update({ hit_count: (exactRow as any).hit_count + 1, last_hit_at: new Date().toISOString() })
                    .eq("id", exactRow.id).then(() => { });

                logRequest(admin, {
                    userId, requestedModel, finalModel: exactRow.model, finalProvider: "cache",
                    latencyMs, isStreaming: false, status: "cached", cacheHit: true, cacheEntryId: exactRow.id,
                });

                return jsonResponse(cachedBody, 200, { "X-Cache": "HIT", "X-Cache-Type": "exact" });
            }
        }

        // ── Decrypt Provider Key ──────────────────────────────────────────────────
        const providerKey = await resolveProviderKey(admin, userId, finalProvider);

        // ── Semantic (Vector) Cache Check — now we have the key for embeddings ────
        if (settings.cache_enabled && !isStreaming && !cacheSidecar.embedding) {
            try {
                const semanticHit = await checkSemanticCache(
                    admin, userId, promptContent, settings, providerKey, cacheSidecar
                );

                if (semanticHit) {
                    // Semantic cache hit
                    const latencyMs = Date.now() - startTime;
                    const cachedBody = typeof semanticHit.response_data === "string"
                        ? JSON.parse(semanticHit.response_data)
                        : semanticHit.response_data;

                    admin.from("gateway_cache_entries")
                        .update({ hit_count: (cachedBody as any).hit_count + 1, last_hit_at: new Date().toISOString() })
                        .eq("id", semanticHit.id).then(() => { });

                    logRequest(admin, {
                        userId, requestedModel, finalModel: semanticHit.model, finalProvider: "cache",
                        latencyMs, isStreaming: false, status: "cached", cacheHit: true, cacheEntryId: semanticHit.id,
                    });

                    return jsonResponse(cachedBody, 200, { "X-Cache": "HIT", "X-Cache-Type": "semantic" });
                }
            } catch (err) {
                console.warn("[cache] Vector search failed, continuing:", err);
                // Non-fatal — continue to upstream provider
            }
        }

        // ── Build Upstream Request ────────────────────────────────────────────────
        let upstreamUrl = "https://api.openai.com/v1/chat/completions";
        const upstreamHeaders: Record<string, string> = { "Content-Type": "application/json" };

        if (finalProvider === "openai") {
            upstreamHeaders["Authorization"] = `Bearer ${providerKey}`;
        } else if (finalProvider === "anthropic") {
            upstreamUrl = "https://api.anthropic.com/v1/messages";
            upstreamHeaders["x-api-key"] = providerKey;
            upstreamHeaders["anthropic-version"] = "2023-06-01";
        }
        // Google / Mistral can be added here in the same pattern

        // ── Forward to Upstream ───────────────────────────────────────────────────
        const upstream = await fetch(upstreamUrl, {
            method: "POST",
            headers: upstreamHeaders,
            body: JSON.stringify(body),
        });

        if (!upstream.ok) {
            const errText = await upstream.text();
            throw new HttpError(
                `Upstream '${finalProvider}' returned error ${upstream.status}: ${errText}`,
                upstream.status,
            );
        }

        const latencyMs = Date.now() - startTime;

        // ── Streaming Response ────────────────────────────────────────────────────
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

        if (settings.cache_enabled && cacheSidecar.embedding) {
            // We have an embedding from the vector search step — store the response
            storeCacheEntry(
                admin, userId, cacheSidecar, promptContent, jsonResp,
                finalModel, finalProvider, promptTokens + compTokens, settings.cache_ttl_hours
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

        // Best-effort log
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
