/**
 * AES-256-GCM Encryption Utility
 * ================================
 * Uses the Web Crypto API (native in Deno — no external deps).
 *
 * Format stored in DB:  base64(IV [12 bytes] || ciphertext)
 *
 * The encryption key is derived from ENCRYPTION_SECRET (env var)
 * via PBKDF2 with a fixed salt. This means the same secret always
 * produces the same derived key, which is what we want for decryption.
 *
 * NEVER import this in frontend code — it is server-only.
 */

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT = "synvertas-gateway-v1"; // fixed salt (key derives from secret)

/**
 * Derive an AES-256-GCM CryptoKey from the raw secret string.
 * This is called once per encrypt/decrypt operation and cached nowhere —
 * the Web Crypto API internally handles the key material securely.
 */
async function deriveCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    // Import raw secret as base material for PBKDF2
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "PBKDF2" },
        false,
        ["deriveKey"],
    );

    // Derive a 256-bit AES-GCM key
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(PBKDF2_SALT),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false, // not extractable
        ["encrypt", "decrypt"],
    );
}

/**
 * Encrypt a plaintext string.
 * Returns a base64 string: base64(IV || ciphertext)
 * Safe to store in the database.
 */
export async function encrypt(plaintext: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit random IV for GCM

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        new TextEncoder().encode(plaintext),
    );

    // Prepend IV to ciphertext so we can extract it on decryption
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);

    return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64-encoded ciphertext (IV || ciphertext).
 * Returns the original plaintext string.
 * Throws if decryption fails (wrong key or tampered data).
 */
export async function decrypt(encryptedBase64: string, secret: string): Promise<string> {
    const key = await deriveCryptoKey(secret);

    const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext,
    );

    return new TextDecoder().decode(plaintext);
}

/**
 * Get the encryption secret from environment variables.
 * Throws at runtime if not configured — fail fast, fail loud.
 */
export function getEncryptionSecret(): string {
    const secret = Deno.env.get("GATEWAY_ENCRYPTION_SECRET");
    if (!secret || secret.length < 32) {
        throw new Error(
            "GATEWAY_ENCRYPTION_SECRET is missing or too short (min 32 chars). " +
            "Set it in Supabase Dashboard → Settings → Edge Functions → Secrets.",
        );
    }
    return secret;
}
