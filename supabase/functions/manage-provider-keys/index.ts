/**
 * Edge Function: manage-provider-keys
 * =====================================
 * Handles CRUD for encrypted LLM provider API keys.
 *
 * Routes (determined by method):
 *   GET    → List provider key metadata (NO plaintext key ever returned)
 *   POST   → Encrypt + store a new provider key
 *   DELETE → Remove a provider key
 *
 * The plaintext key is ONLY ever present in this Edge Function's memory
 * during encryption. It is never returned to the client in any response.
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GATEWAY_ENCRYPTION_SECRET (min 32 chars)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { encrypt, getEncryptionSecret } from "../_shared/crypto.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

// Valid provider identifiers
const VALID_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

// Extract the last 4 chars for display (e.g. "sk-...abcd")
function buildKeyPrefix(plainKey: string): string {
    const trimmed = plainKey.trim();
    const suffix = trimmed.slice(-4);
    return `...${suffix}`;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // ─── Auth: Identify the calling user ─────────────────────────────────────
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const authHeader = req.headers.get("Authorization") ?? "";
        if (!authHeader.startsWith("Bearer ")) {
            return json({ error: "Missing or invalid Authorization header" }, 401);
        }

        // User-scoped client — enforces RLS automatically
        const userClient = createClient(supabaseUrl, anonKey, {
            global: { headers: { Authorization: authHeader } },
            auth: { persistSession: false },
        });

        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) {
            return json({ error: "Unauthorized" }, 401);
        }

        // Service-role client — used only for direct decryption path (internal only)
        const adminClient = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        // ─── GET: Return key metadata (never plaintext) ───────────────────────────
        if (req.method === "GET") {
            const { data, error } = await userClient
                .from("gateway_provider_keys")
                .select("id, provider, key_prefix, is_active, last_used_at, created_at, updated_at")
                .eq("user_id", user.id)
                .order("provider");

            if (error) throw error;

            return json({ keys: data ?? [] }, 200);
        }

        // ─── POST: Encrypt & store a new key ─────────────────────────────────────
        if (req.method === "POST") {
            const body = await req.json().catch(() => null);
            if (!body) return json({ error: "Invalid JSON body" }, 400);

            const { provider, api_key: plaintextKey } = body as {
                provider: string;
                api_key: string;
            };

            // Validate provider
            if (!VALID_PROVIDERS.includes(provider as Provider)) {
                return json(
                    { error: `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(", ")}` },
                    400,
                );
            }

            // Validate key presence and minimum length
            if (!plaintextKey || typeof plaintextKey !== "string" || plaintextKey.trim().length < 10) {
                return json({ error: "api_key is required and must be at least 10 characters" }, 400);
            }

            const trimmedKey = plaintextKey.trim();

            // Encrypt — key now lives only in memory of this function
            const secret = getEncryptionSecret();
            const encryptedBase64 = await encrypt(trimmedKey, secret);
            const keyPrefix = buildKeyPrefix(trimmedKey);

            // Upsert (one key per user per provider)
            const { error: upsertError } = await adminClient
                .from("gateway_provider_keys")
                .upsert(
                    {
                        user_id: user.id,
                        provider,
                        key_encrypted: encryptedBase64, // stored as TEXT (base64)
                        key_prefix: keyPrefix,
                        is_active: true,
                    },
                    { onConflict: "user_id,provider" },
                );

            if (upsertError) throw upsertError;

            // Return only metadata — plaintext is gone from memory after this return
            return json(
                {
                    success: true,
                    message: `${provider} API key saved securely.`,
                    provider,
                    key_prefix: keyPrefix,
                },
                200,
            );
        }

        // ─── DELETE: Remove a provider key ───────────────────────────────────────
        if (req.method === "DELETE") {
            const url = new URL(req.url);
            const provider = url.searchParams.get("provider");

            if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
                return json({ error: "Invalid or missing provider query parameter" }, 400);
            }

            const { error: deleteError } = await userClient
                .from("gateway_provider_keys")
                .delete()
                .eq("user_id", user.id)
                .eq("provider", provider);

            if (deleteError) throw deleteError;

            return json({ success: true, message: `${provider} key removed.` }, 200);
        }

        return json({ error: "Method not allowed" }, 405);

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal server error";
        console.error("[manage-provider-keys]", message);
        return json({ error: message }, 500);
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}
