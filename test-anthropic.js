const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const saasKey = "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

async function run() {
    console.log("Trying Anthropic specifically...");
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "x-gateway-key": saasKey },
        body: JSON.stringify({ model: "claude-haiku-4-5", messages: [{ role: "user", content: `Test ${Date.now()}` }] })
    });
    
    // Fallbacks happen automatically. But if Anthropic fails, we want to see the Gateway's Cloud logs.
    // Let's also hit directly with Anthropic to see what happens.
    const text = await res.text();
    console.log("Gateway Response:", res.status, text);
}

run();
