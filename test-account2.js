const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";
const saasKey = "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834";

const models = [
    { name: "OpenAI",    model: "gpt-4o-mini" },
    { name: "Anthropic", model: "claude-3-5-haiku-20241022" },
    { name: "Gemini",    model: "gemini-2.0-flash-lite" },
];

async function test(model) {
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${anonKey}`,
            "x-gateway-key": saasKey,
        },
        body: JSON.stringify({
            model,
            messages: [{ role: "user", content: `Test ${Date.now()} — welches Modell bist du?` }]
        })
    });
    const data = await res.json();
    const provider = res.headers.get("X-Provider-Used") || "?";
    if (data.error) return `❌ ERROR (${data.error.status}): ${data.error.message}`;
    return `✅ Model: ${data.model}  [Provider: ${provider}]`;
}

async function run() {
    console.log(`Testing Account 2 (sgw_e73c...)\n`);
    for (const m of models) {
        process.stdout.write(`  → Requesting ${m.name.padEnd(10)} (${m.model}) ... `);
        const result = await test(m.model);
        console.log(result);
    }
}
run();
