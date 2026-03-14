// This script calls manage-provider-keys to show what keys are stored for each user
// Uses the Supabase user JWT to authenticate

const supabaseUrl = "https://jgduivjxkbtbvezqybko.supabase.co";
const manageKeysUrl = `${supabaseUrl}/functions/v1/manage-provider-keys`;

// ANON KEY from the app
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZHVpdmp4a2J0YnZlenF5YmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzI4NzcsImV4cCI6MjA4ODkwODg3N30._79NzAYIzjC6tuWmXoZZnl2JZpMtjA8zN8hdvionZao";

// ─── To get a user JWT, log in via Supabase Auth ───────────────────────────
// Replace these with the credentials for each account to test:

const accounts = [
    { name: "Account 1", email: "", password: "" },
    { name: "Account 2", email: "", password: "" },
];

async function getJWT(email, password) {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": anonKey,
        },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.access_token) {
        console.error("Login failed:", data.error_description || JSON.stringify(data));
        return null;
    }
    return data.access_token;
}

async function listKeys(jwt, accountName) {
    console.log(`\n=== ${accountName} ===`);
    if (!jwt) { console.log("  (No JWT — skipped)"); return; }
    
    const res = await fetch(manageKeysUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${jwt}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.error) {
        console.log("  Error:", data.error);
        return;
    }
    if (!data.keys || data.keys.length === 0) {
        console.log("  No provider keys stored for this account!");
        return;
    }
    for (const k of data.keys) {
        console.log(`  Provider: ${k.provider} | Prefix: ${k.key_prefix} | Active: ${k.is_active}`);
    }
}

async function run() {
    console.log("Fetching provider keys via manage-provider-keys Edge Function...");
    console.log("NOTE: Fill in account credentials above to test.");
    
    for (const acct of accounts) {
        if (!acct.email) {
            console.log(`\n=== ${acct.name} === (no email set — skipped)`);
            continue;
        }
        const jwt = await getJWT(acct.email, acct.password);
        await listKeys(jwt, acct.name);
    }
}

run();
