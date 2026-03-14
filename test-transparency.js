const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";
const saasKey = "sgw_e73c1bec9651823092465e4ff296ad16ef0909bf024e8b5586a4acc17ba9b834"; // Account 2

async function testTransparency(modelName) {
    console.log(`\n--- Requesting specific model: ${modelName} ---`);
    const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}`, "x-gateway-key": saasKey },
        body: JSON.stringify({
            model: modelName,
            messages: [{ role: "user", content: `Say 'TRANSPARENT' if you are ${modelName}` }]
        })
    });
    const data = await res.json();
    console.log(`Requested: ${modelName}`);
    console.log(`Returned : ${data.model}`);
    if (data.model.startsWith(modelName)) {
        console.log("✅ SUCCESS: Model passthrough is transparent.");
    } else {
        console.log("❌ FAILURE: Model was swapped.");
    }
}

async function run() {
    // We test with a non-default OpenAI model
    await testTransparency("gpt-4o");
}
run();
