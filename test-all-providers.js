const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
const mySaasKey = "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

const modelsToTest = [
  "gpt-4o-mini",
  "claude-3-5-haiku-20241022",
  "gemini-1.5-flash"
];

async function runTests() {
  for (const model of modelsToTest) {
    console.log(`\n\n===========================================`);
    console.log(`🚀 Teste Modell: ${model}`);
    console.log(`===========================================\n`);

    try {
      // Force fresh request to bypass cache for the test
      const response = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`,
          "x-gateway-key": mySaasKey,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "user", content: `Das ist ein frischer Test ohne Cache: ${Date.now()}. Welches Modell bist du?` }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`❌ Fehler (${response.status}): ${errText}`);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Erfolgreiche Antwort:`);
      console.log(`   Model laut API: ${data.model}`);
      console.log(`   Cache Hit: ${response.headers.get("x-cache") || "MISS"}`);
      console.log(`   Text: "${data.choices[0].message.content.trim()}"`);
      
    } catch (error) {
      console.error(`❌ Netzwerk-/Verbindungsfehler:`, error.message);
    }
    
    // Kleiner Sleep zwischen den Requests
    await new Promise(r => setTimeout(r, 2000));
  }
}

runTests();
