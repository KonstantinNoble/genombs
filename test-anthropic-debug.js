const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";
const saasKey = "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834";

async function test(model) {
    const uniquePrompt = `Unique test ${Date.now()} ${Math.random()} — say HELLO`;
    console.log(`\nTesting primary request (NO CACHE): ${model}`);
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "x-gateway-key": saasKey },
        body: JSON.stringify({ model, messages: [{ role: "user", content: uniquePrompt }] })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Provider: ${res.headers.get("X-Provider-Used")}`);
    console.log(`Cache: ${res.headers.get("X-Cache")}`);
    if (data.error) {
        console.log(`Error: ${JSON.stringify(data.error, null, 2)}`);
    } else {
        console.log(`Model returned: ${data.model}`);
    }
}

async function run() {
    await test("claude-haiku-4-5");
}
run();
