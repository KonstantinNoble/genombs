import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * fetch-github-repo
 *
 * Fetches relevant source code files from a public GitHub repository.
 * Returns a structured summary for AI analysis context.
 *
 * No API key required for public repos (60 requests/hour rate limit).
 */

const RELEVANT_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".scss",
  ".json", ".md", ".vue", ".svelte",
];

const PRIORITY_FILES = [
  "package.json", "README.md", "readme.md",
  "tsconfig.json", "next.config.js", "next.config.ts",
  "vite.config.ts", "vite.config.js",
  "tailwind.config.ts", "tailwind.config.js",
  "nuxt.config.ts", "nuxt.config.js",
];

const IGNORE_DIRS = [
  "node_modules", ".git", "dist", "build", ".next", ".nuxt",
  "coverage", ".cache", "__pycache__", ".turbo",
  "vendor", ".vercel", ".netlify",
];

const MAX_FILES = 15;
const MAX_TOTAL_CHARS = 30000;
const MAX_FILE_LINES = 200;

interface RepoFile {
  path: string;
  content: string;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleaned = url.trim().replace(/\/$/, "");
    const match = cleaned.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

function isRelevantFile(path: string): boolean {
  const lowerPath = path.toLowerCase();

  // Skip files in ignored directories
  for (const dir of IGNORE_DIRS) {
    if (lowerPath.includes(`${dir}/`) || lowerPath.startsWith(`${dir}/`)) return false;
  }

  // Skip lock files and large generated files
  if (lowerPath.includes("lock") || lowerPath.endsWith(".lock")) return false;
  if (lowerPath.endsWith(".min.js") || lowerPath.endsWith(".min.css")) return false;
  if (lowerPath.endsWith(".map")) return false;

  // Check if file is a priority file
  const filename = path.split("/").pop() || "";
  if (PRIORITY_FILES.includes(filename)) return true;

  // Check extension
  return RELEVANT_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));
}

function prioritizeFiles(files: string[]): string[] {
  const priority: string[] = [];
  const regular: string[] = [];

  for (const file of files) {
    const filename = file.split("/").pop() || "";
    if (PRIORITY_FILES.includes(filename)) {
      priority.push(file);
    } else {
      regular.push(file);
    }
  }

  // Sort regular files: prefer src/ and root-level files
  regular.sort((a, b) => {
    const aIsSrc = a.startsWith("src/") ? 0 : 1;
    const bIsSrc = b.startsWith("src/") ? 0 : 1;
    if (aIsSrc !== bIsSrc) return aIsSrc - bIsSrc;

    // Prefer shallower files
    const aDepth = a.split("/").length;
    const bDepth = b.split("/").length;
    return aDepth - bDepth;
  });

  return [...priority, ...regular].slice(0, MAX_FILES);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { repoUrl } = await req.json();

    if (!repoUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "repoUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { owner, repo } = parsed;
    console.log(`Fetching repo: ${owner}/${repo}`);

    // 1. Get the default branch
    const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { "User-Agent": "Synvertas-DeepAnalysis/1.0" },
    });

    if (repoResp.status === 404) {
      return new Response(
        JSON.stringify({ success: false, error: "Repository not found. Only public repositories are supported." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (repoResp.status === 403) {
      return new Response(
        JSON.stringify({ success: false, error: "GitHub API rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!repoResp.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `GitHub API error: ${repoResp.status}` }),
        { status: repoResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const repoData = await repoResp.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Get the file tree
    const treeResp = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers: { "User-Agent": "Synvertas-DeepAnalysis/1.0" } }
    );

    if (!treeResp.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch repository tree: ${treeResp.status}` }),
        { status: treeResp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const treeData = await treeResp.json();
    const allFiles = (treeData.tree || [])
      .filter((item: { type: string; path: string }) => item.type === "blob" && isRelevantFile(item.path))
      .map((item: { path: string }) => item.path);

    console.log(`Found ${allFiles.length} relevant files, selecting top ${MAX_FILES}`);

    const selectedFiles = prioritizeFiles(allFiles);

    // 3. Fetch file contents (in parallel, batched)
    let totalChars = 0;
    const fetchedFiles: RepoFile[] = [];

    const filePromises = selectedFiles.map(async (filePath: string): Promise<RepoFile | null> => {
      try {
        const contentResp = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${defaultBranch}`,
          { headers: { "User-Agent": "Synvertas-DeepAnalysis/1.0" } }
        );

        if (!contentResp.ok) return null;

        const contentData = await contentResp.json();
        if (contentData.encoding !== "base64" || !contentData.content) return null;

        // Decode base64
        const decoded = atob(contentData.content.replace(/\n/g, ""));
        
        // Truncate to MAX_FILE_LINES
        const lines = decoded.split("\n");
        const truncated = lines.slice(0, MAX_FILE_LINES).join("\n");
        const wasTruncated = lines.length > MAX_FILE_LINES;

        return {
          path: filePath,
          content: truncated + (wasTruncated ? `\n// ... (${lines.length - MAX_FILE_LINES} more lines truncated)` : ""),
        };
      } catch (err) {
        console.warn(`Failed to fetch ${filePath}:`, err);
        return null;
      }
    });

    const results = await Promise.allSettled(filePromises);
    
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        if (totalChars + result.value.content.length > MAX_TOTAL_CHARS) {
          // Truncate this file to fit
          const remaining = MAX_TOTAL_CHARS - totalChars;
          if (remaining > 200) {
            result.value.content = result.value.content.substring(0, remaining) + "\n// ... (truncated to fit context limit)";
            fetchedFiles.push(result.value);
            totalChars += result.value.content.length;
          }
          break;
        }
        fetchedFiles.push(result.value);
        totalChars += result.value.content.length;
      }
    }

    // 4. Build the full file tree for context
    const fileTree = allFiles.slice(0, 100).join("\n");

    // 5. Build structured summary
    const summary = {
      repo: `${owner}/${repo}`,
      defaultBranch,
      totalRelevantFiles: allFiles.length,
      fetchedFiles: fetchedFiles.length,
      fileTree,
      files: fetchedFiles,
      totalChars,
    };

    console.log(`Fetched ${fetchedFiles.length} files, ${totalChars} total chars`);

    return new Response(
      JSON.stringify({ success: true, data: summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-github-repo error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
