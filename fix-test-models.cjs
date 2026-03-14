const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(".").filter(f => f.startsWith("test-") && f.endsWith(".js"));
const replacements = [
    ["gemini-1.5-flash", "gemini-2.5-flash"],
    ["gemini-1.5-pro", "gemini-2.5-pro"],
    ["claude-3-5-haiku-20241022", "claude-haiku-4-5"],
    ["claude-3-5-sonnet-20241022", "claude-sonnet-4-5"],
];

for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    let changed = false;
    for (const [from, to] of replacements) {
        if (content.includes(from)) { content = content.replaceAll(from, to); changed = true; }
    }
    if (changed) { fs.writeFileSync(file, content); console.log(`✅ Updated: ${file}`); }
    else console.log(`  Unchanged: ${file}`);
}
