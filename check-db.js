const supabaseUrl = "https://jgduivjxkbtbvezqybko.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMzMjg3NywiZXhwIjoyMDg4OTA4ODc3fQ.fiV-a2m0dYicxltVeVcKzUpPX3HZILmE5kVSuTIKsnQ";

async function run() {
  const saasKey = "sgw_78d8d0a3800c44ca8c2625f1c6838fdd7c2ea9b8640d5982337b5084a67c8ac3";

  // 1. Get user_id
  const userRes = await fetch(`${supabaseUrl}/rest/v1/gateway_saas_keys?api_key=eq.${saasKey}`, {
    headers: { "apikey": serviceKey, "Authorization": `Bearer ${serviceKey}` }
  });
  const userData = await userRes.json();
  const userId = userData[0].user_id;

  // 2. Update settings
  const updateRes = await fetch(`${supabaseUrl}/rest/v1/gateway_settings?user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { 
        "apikey": serviceKey, 
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        short_query_model: "o4-mini",
        long_query_model: "gpt-4o"
    })
  });
  
  if (updateRes.ok) {
     console.log("Database models updated to gpt-4.5-preview!");
  } else {
     console.error("Failed to update database", await updateRes.text());
  }
}

run();
