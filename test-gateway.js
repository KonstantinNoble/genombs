// test-gateway.js
// Ein einfaches Test-Skript für dein Synvertas Gateway

async function runTest() {
  console.log("🚀 Sende Anfrage an Synvertas Gateway...");

  // WICHTIG: Im Dashboard steht "gateway.synvertas.com" als Platzhalter für später.
  // Aktuell läuft dein Gateway live auf deiner Supabase URL!
  const gatewayUrl = "https://jgduivjxkbtbvezqybko.supabase.co/functions/v1/v1-chat-completions";
  const mySaasKey = "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3";
  // Supabase Anon Key — wird benötigt, damit Supabase die Anfrage zur Edge Function weiterleitet
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

  try {
    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Supabase braucht einen gültigen JWT im Authorization-Header
        "Authorization": `Bearer ${supabaseAnonKey}`,
        // Dein eigener SaaS Key kommt als separater Header
        "x-gateway-key": mySaasKey,
      },
      body: JSON.stringify({
        // Du forderst ein Modell an
        model: "gpt-4o",
        messages: [
          { role: "user", content: "Schreibe mir auf Deutsch genau einen Satz darüber, warum APIs wichtig sind für Entwickler." }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gateway Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log("\n✅ Erfolgreiche Antwort vom Gateway:\n");
    console.log(data.choices[0].message.content);

    // Wir können auch sehen, ob es aus dem Cache kam!
    console.log("\n-----------------------------------");
    console.log("War das ein Cache-Hit? ", response.headers.get("x-cache") === "HIT" ? "JA! 💸" : "Nein, frische API Anfrage.");
    console.log("-----------------------------------");

  } catch (error) {
    console.error("\n❌ Fehler beim Testen:\n", error.message);
    console.log("\nHINWEIS: Wenn hier ein '401' Code von OpenAI steht, bedeutet das, dass das Gateway funktioniert hat, aber der OpenAI Key den du im Dashboard gespeichert hast, ungültig ist oder kein Guthaben hat.");
  }
}

runTest();
