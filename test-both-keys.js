const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

const keys = [
    { name: "SGW 1 (The one that had only Gemini before)", key: "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3" },
    { name: "SGW 2 (The one that had OpenAI+Anthropic)", key: "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834" }
];

async function testProvider(saasKey, model) {
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "x-gateway-key": saasKey },
        body: JSON.stringify({ model, messages: [{ role: "user", content: `Test fallback on missing keys: ${Date.now()}` }] })
    });
    const data = await res.json();
    return data.model || JSON.stringify(data);
}

async function run() {
    for (const k of keys) {
        console.log(`\nTesting ${k.name}:`);
        console.log(`- Requesting Anthropic (claude-haiku-4-5) -> Received:`, await testProvider(k.key, "claude-haiku-4-5"));
        console.log(`- Requesting Gemini (gemini-2.5-flash)            -> Received:`, await testProvider(k.key, "gemini-2.5-flash"));
    }
}
run();
