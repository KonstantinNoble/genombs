/**
 * Test Script für dein neues KI-Gateway
 * =====================================
 * Führe dieses Skript aus, um zu testen, ob dein Proxy funktioniert.
 * 
 * Anleitung:
 * 1. Trage unten bei "SGW_API_KEY" deinen `sgw_...` Key ein (aus dem Dashboard kopieren).
 * 2. Trage bei "PROJECT_REF" deine Supabase Projekt-ID ein (z.B. "a1b2c3d4e").
 * 3. Führe das Skript im Terminal aus: `node test-gateway.js`
 */

const SGW_API_KEY = "sgw_HIER_DEIN_KEY_EINTRAGEN"; // Beispiel: sgw_5f3a...
const PROJECT_REF = "HIER_DEINE_PROJEKT_REF";    // Beispiel: a6d4c14d (oder ähnlich)

const GATEWAY_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/v1-chat-completions`;

async function testGateway() {
    console.log("🚀 Sende Test-Anfrage an Gateway...");
    console.log(`URL: ${GATEWAY_URL}`);

    try {
        const response = await fetch(GATEWAY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SGW_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Du bist ein hilfreicher Assistent." },
                    { role: "user", content: "Hallo! Sprichst du deutsch? Antworte kurz." }
                ],
                stream: false // Für den ersten Test ohne Streaming
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Fehler vom Gateway (${response.status}):`, errorText);
            return;
        }

        const data = await response.json();
        console.log("✅ Erfolgreiche Antwort vom Gateway!");
        console.log("--------------------------------------------------");
        console.log("Antwort:", data.choices[0].message.content);
        console.log("Verbrauchte Tokens:", data.usage.total_tokens);
        console.log("--------------------------------------------------");

    } catch (error) {
        console.error("❌ Netzwerk-Fehler:", error.message);
    }
}

testGateway();
