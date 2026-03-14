const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

// Test both accounts for all three models
const accounts = [
    { name: "Account 1 (sgw_78d8...)", key: "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3" },
    { name: "Account 2 (sgw_e73c...)", key: "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834" },
];
const models = [
    { name: "OpenAI", model: "gpt-4o-mini" },
    { name: "Anthropic", model: "claude-haiku-4-5" },
    { name: "Gemini", model: "gemini-2.5-flash" },
];

async function test(saasKey, model) {
    try {
        const res = await fetch(gatewayUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "x-gateway-key": saasKey },
            body: JSON.stringify({ model, messages: [{ role: "user", content: `Test ${Date.now()}` }] })
        });
        const data = await res.json();
        if (data.error) return `❌ ERROR: ${data.error.message}`;
        const providerUsed = res.headers.get("X-Provider-Used") || "?";
        return `✅ ${data.model}  [provider: ${providerUsed}]`;
    } catch (e) {
        return `❌ Network error: ${e.message}`;
    }
}

async function run() {
    for (const acct of accounts) {
        console.log(`\n====== ${acct.name} ======`);
        for (const m of models) {
            process.stdout.write(`  Requesting ${m.name} ... `);
            const result = await test(acct.key, m.model);
            console.log(result);
        }
    }
}
run();
