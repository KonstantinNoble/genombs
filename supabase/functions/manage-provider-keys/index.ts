/**
 * Edge Function: manage-provider-keys
 * =====================================
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

// ─── CRYPTO FUNCTIONS INLINED ───────────────────────────────────────────────
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = "synvertas-gateway-v1"; // fixed salt (key derives from secret)

async function deriveCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(PBKDF2_SALT),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

async function encrypt(plaintext: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(plaintext),
    );

    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);

    return encode(combined);
}

function getEncryptionSecret(): string {
    const secret = Deno.env.get("GATEWAY_ENCRYPTION_SECRET");
    if (!secret || secret.length < 32) {
        throw new Error("GATEWAY_ENCRYPTION_SECRET is missing or too short.");
    }
    return secret;
}
// ────────────────────────────────────────────────────────────────────────────

const VALID_PROVIDERS = ["openai", "anthropic", "google", "mistral"] as const;
type Provider = (typeof VALID_PROVIDERS)[number];

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
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        // 1. Hole den JWT Token aus dem Header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return json({ error: "DEBUG: Missing Authorization header" }, 401);
        }

        const token = authHeader.replace("Bearer ", "").trim();
        if (!token) {
            return json({ error: "DEBUG: JWT Token empty" }, 401);
        }

        // 2. Erstelle einen Admin-Client (ignoriert RLS, darf alles)
        const adminClient = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        // 3. Verifiziere den JWT-Token des Nutzers manuell über den Admin-Client!
        const { data: { user }, error: userError } = await adminClient.auth.getUser(token);

        if (userError || !user) {
            console.error("[manage-provider-keys] JWT verification failed:", userError?.message);
            return json({ error: "DEBUG: Unauthorized token" }, 401);
        }

        // --- Ab hier wissen wir zu 100%, dass der User legitim eingeloggt ist! ---

        // ─── GET: Return key metadata (never plaintext) ───────────────────────────
        if (req.method === "GET") {
            const { data, error } = await adminClient
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
            if (!body) return json({ error: "DEBUG: Invalid JSON body" }, 400);

            const { provider, api_key: plaintextKey } = body as {
                provider: string;
                api_key: string;
            };

            if (!VALID_PROVIDERS.includes(provider as Provider)) {
                return json({ error: "DEBUG: Invalid provider" }, 400);
            }

            if (!plaintextKey || typeof plaintextKey !== "string" || plaintextKey.trim().length < 10) {
                return json({ error: "DEBUG: api_key is too short" }, 400);
            }

            const trimmedKey = plaintextKey.trim();
            const secret = getEncryptionSecret();
            const encryptedBase64 = await encrypt(trimmedKey, secret);
            const keyPrefix = buildKeyPrefix(trimmedKey);

            // Speichern mit Admin-Client
            const { error: upsertError } = await adminClient
                .from("gateway_provider_keys")
                .upsert(
                    {
                        user_id: user.id,
                        provider,
                        key_encrypted: encryptedBase64,
                        key_prefix: keyPrefix,
                        is_active: true,
                    },
                    { onConflict: "user_id,provider" },
                );

            if (upsertError) throw upsertError;

            return json(
                { success: true, message: `${provider} API key saved securely.`, provider, key_prefix: keyPrefix },
                200,
            );
        }

        // ─── DELETE: Remove a provider key ───────────────────────────────────────
        if (req.method === "DELETE") {
            const url = new URL(req.url);
            const provider = url.searchParams.get("provider");

            if (!provider || !VALID_PROVIDERS.includes(provider as Provider)) {
                return json({ error: "DEBUG: Invalid provider" }, 400);
            }

            const { error: deleteError } = await adminClient
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
        console.error("[manage-provider-keys] FATAL:", message);
        return json({ error: `FATAL_ERROR: ${message}` }, 500);
    }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}
