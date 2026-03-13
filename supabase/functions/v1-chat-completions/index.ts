/**
 * Edge Function: v1-chat-completions
 * =====================================
 * KI-Gateway Proxy — vollständig mit Semantic Cache.
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

async function decrypt(encryptedBase64: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);
    
    // Normalize base64: handle URL-safe characters, whitespace, and missing padding
    let normalized = encryptedBase64.trim()
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    // Re-add missing base64 padding
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

// ============================================================================
// DATABASE
// ============================================================================

interface GatewaySettings {
    cache_enabled: boolean; cache_similarity: number; cache_ttl_hours: number;
    smart_routing_enabled: boolean; short_query_threshold: number;
    short_query_model: string; long_query_model: string; fallback_enabled: boolean;
}

const DEFAULT_SETTINGS: GatewaySettings = {
    cache_enabled: true, cache_similarity: 0.95, cache_ttl_hours: 24,
    smart_routing_enabled: true, short_query_threshold: 100,
    short_query_model: "gpt-4o-mini", long_query_model: "gpt-4o", fallback_enabled: true,
};

async function resolveUser(admin: SupabaseClient, saasKey: string): Promise<{ userId: string; settings: GatewaySettings }> {
    const { data, error } = await admin.from("gateway_saas_keys").select("user_id")
        .eq("api_key", saasKey).eq("is_active", true).maybeSingle();
    if (error || !data?.user_id) throw new HttpError("Invalid or inactive Synvertas API key.", 401);
    admin.from("gateway_saas_keys").update({ last_used_at: new Date().toISOString() }).eq("api_key", saasKey).then(() => { });
    const { data: s } = await admin.from("gateway_settings").select("*").eq("user_id", data.user_id).maybeSingle();
    return { userId: data.user_id, settings: { ...DEFAULT_SETTINGS, ...(s ?? {}) } };
}

async function resolveProviderKey(admin: SupabaseClient, userId: string, provider: string): Promise<string> {
    const { data, error } = await admin.from("gateway_provider_keys").select("key_encrypted")
        .eq("user_id", userId).eq("provider", provider).eq("is_active", true).maybeSingle();
    if (error || !data?.key_encrypted) throw new HttpError(`No active ${provider} API key found. Please add it in your Synvertas Dashboard.`, 400);
    const secret = getEncryptionSecret();
    const plaintext = await decrypt(data.key_encrypted as string, secret);
    admin.from("gateway_provider_keys").update({ last_used_at: new Date().toISOString() }).eq("user_id", userId).eq("provider", provider).then(() => { });
    return plaintext;
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
        finalProvider = (req.headers.get("x-provider") || "openai") as Provider;

        if (settings.smart_routing_enabled) {
            const tokenEstimate = JSON.stringify(body.messages).length / 4;
            finalModel = tokenEstimate < settings.short_query_threshold ? settings.short_query_model : settings.long_query_model;
            if (finalModel.includes("claude")) finalProvider = "anthropic";
            else if (finalModel.includes("gpt")) finalProvider = "openai";
            else if (finalModel.includes("gemini")) finalProvider = "google";
            else if (finalModel.includes("mistral") || finalModel.includes("mixtral")) finalProvider = "mistral";
            body.model = finalModel;
        }

        const promptContent = JSON.stringify(body.messages);
        const cacheSidecar: { promptHash?: string; embedding?: number[] } = {};

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

        const providerKey = await resolveProviderKey(admin, userId, finalProvider);
        const upstream_cfg = buildUpstreamRequest(finalProvider, providerKey, finalModel, body);
        const upstream = await fetch(upstream_cfg.url, { method: "POST", headers: upstream_cfg.headers, body: JSON.stringify(upstream_cfg.body) });

        if (!upstream.ok) {
            const errText = await upstream.text();
            throw new HttpError(`Upstream '${finalProvider}' returned error ${upstream.status}: ${errText}`, upstream.status);
        }

        const latencyMs = Date.now() - startTime;

        if (isStreaming) {
            const { readable, writable } = new TransformStream();
            upstream.body?.pipeTo(writable);
            logRequest(admin, { userId, requestedModel, finalModel, finalProvider, latencyMs, isStreaming: true, status: "success" });
            return new Response(readable, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive", "X-Cache": "MISS" } });
        }

        const jsonResp = await upstream.json();
        const promptTokens = jsonResp.usage?.prompt_tokens || 0;
        const compTokens = jsonResp.usage?.completion_tokens || 0;

        if (settings.cache_enabled && cacheSidecar.promptHash) {
            storeCacheEntry(admin, userId, cacheSidecar, promptContent, jsonResp, finalModel, finalProvider, promptTokens + compTokens, settings.cache_ttl_hours);
        }

        logRequest(admin, { userId, requestedModel, finalModel, finalProvider, latencyMs, isStreaming: false, promptTokens, compTokens, status: "success", cacheHit: false });
        return jsonResponse(jsonResp, 200, { "X-Cache": "MISS" });

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
