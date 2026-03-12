/**
 * Shared: resolveProviderKey
 * ==========================
 * INTERNAL ONLY — used by the gateway proxy Edge Function to decrypt
 * a provider key at request time.
 *
 * Flow inside the proxy:
 *   1. Look up the encrypted key for the user + provider from DB
 *   2. Decrypt in-memory using GATEWAY_ENCRYPTION_SECRET
 *   3. Use the plaintext key to call the upstream LLM provider
 *   4. Plaintext never leaves this function's scope
 *
 * This file must NEVER be imported into frontend code.
 */

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { decrypt, getEncryptionSecret } from "./crypto.ts";

export interface ResolvedKey {
    provider: string;
    plaintext: string; // NEVER forward to client
}

/**
 * Fetch + decrypt the active API key for a given user and provider.
 * Throws if no key is found or decryption fails.
 *
 * @param adminClient  Service-role Supabase client (bypasses RLS)
 * @param userId       Auth user UUID
 * @param provider     One of 'openai' | 'anthropic' | 'google' | 'mistral'
 */
export async function resolveProviderKey(
    adminClient: SupabaseClient,
    userId: string,
    provider: string,
): Promise<ResolvedKey> {
    // Fetch the encrypted key — service role bypasses RLS so this is safe
    const { data, error } = await adminClient
        .from("gateway_provider_keys")
        .select("key_encrypted")
        .eq("user_id", userId)
        .eq("provider", provider)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        throw new Error(`DB error fetching provider key: ${error.message}`);
    }

    if (!data?.key_encrypted) {
        throw new Error(
            `No active API key found for provider '${provider}'. ` +
            `Please add your key in the Gateway section of the dashboard.`,
        );
    }

    // Decrypt in-memory — plaintext exists only for the duration of this call
    const secret = getEncryptionSecret();
    const plaintext = await decrypt(data.key_encrypted as string, secret);

    // Update last_used_at (fire-and-forget, don't await)
    adminClient
        .from("gateway_provider_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("provider", provider)
        .then(() => { })
        .catch((e: Error) => console.warn("[resolveProviderKey] last_used_at update failed:", e.message));

    return { provider, plaintext };
}

/**
 * Resolve the gateway SaaS key → user_id mapping.
 * Used at the entry point of every proxy request.
 *
 * @param adminClient  Service-role Supabase client
 * @param saasApiKey   The 'sgw_...' key from the Authorization header
 */
export async function resolveUserFromSaasKey(
    adminClient: SupabaseClient,
    saasApiKey: string,
): Promise<string> {
    const { data, error } = await adminClient
        .from("gateway_saas_keys")
        .select("user_id")
        .eq("api_key", saasApiKey)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        throw new Error(`DB error resolving SaaS key: ${error.message}`);
    }

    if (!data?.user_id) {
        throw new Error("Invalid or inactive API key.");
    }

    // Update last_used_at (fire-and-forget)
    adminClient
        .from("gateway_saas_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("api_key", saasApiKey)
        .then(() => { })
        .catch((e: Error) => console.warn("[resolveUserFromSaasKey] last_used_at update failed:", e.message));

    return data.user_id as string;
}
