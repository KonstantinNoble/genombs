// This script tests a SPECIFIC provider directly to see if decryption works,
// bypassing the fallback chain entirely.
const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

const accounts = [
    { name: "Account 1 (sgw_78d8)", key: "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3" },
    { name: "Account 2 (sgw_e73c)", key: "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834" },
];

// These model names are the PRIMARY provider models - no ambiguity, no fallback inference
const tests = [
    { provider: "OpenAI",    model: "gpt-4o-mini" },
    { provider: "Anthropic", model: "claude-haiku-4-5" },
    { provider: "Google",    model: "gemini-2.5-flash" },
];

async function test(saasKey, model) {
    const uniqueMsg = `Unique-${Date.now()}-${Math.random().toString(36).slice(2)} — respond with just: OK`;
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
            "x-gateway-key": saasKey,
        },
        body: JSON.stringify({ model, messages: [{ role: "user", content: uniqueMsg }] })
    });
    const data = await res.json();
    const provider = res.headers.get("X-Provider-Used") ?? "?";
    const cache = res.headers.get("X-Cache") ?? "MISS";
    if (data.error) return `❌ [${res.status}] ${data.error.message?.slice(0, 80)}`;
    return `✅ ${data.model}  [provider: ${provider}]  [cache: ${cache}]`;
}

async function run() {
    for (const acct of accounts) {
        console.log(`\n====== ${acct.name} ======`);
        for (const t of tests) {
            process.stdout.write(`  → ${t.provider.padEnd(11)} (${t.model}) ... `);
            console.log(await test(acct.key, t.model));
        }
    }
}
run();
