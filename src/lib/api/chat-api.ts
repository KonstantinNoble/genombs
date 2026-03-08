/**
 * API client for all chat-related backend calls.
 * Uses the external Supabase project for DB ops,
 * and Lovable Cloud for new edge functions (customer-search, generate-post).
 */
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/external-client";
import type { Conversation, Message, WebsiteProfile, ImprovementTask } from "@/types/chat";

// Lovable Cloud URL for new edge functions
const LOVABLE_CLOUD_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const LOVABLE_CLOUD_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ─── Customer Search (Lovable Cloud) ───

export async function customerSearch(
  url: string,
  accessToken: string
): Promise<{
  id: string;
  url: string;
  product_summary: string;
  icp: any;
  communities: any[];
}> {
  const resp = await fetch(`${LOVABLE_CLOUD_URL}/functions/v1/customer-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: LOVABLE_CLOUD_ANON_KEY,
    },
    body: JSON.stringify({ url }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Customer search failed");
  }

  return resp.json();
}

// ─── Post Generator (Lovable Cloud) ───

export async function generatePost({
  platform,
  tone,
  goal,
  productContext,
  audienceContext,
  model,
  accessToken,
  onDelta,
  onDone,
}: {
  platform: string;
  tone: string;
  goal: string;
  productContext: string;
  audienceContext?: any;
  model: string;
  accessToken: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}): Promise<void> {
  const resp = await fetch(`${LOVABLE_CLOUD_URL}/functions/v1/generate-post`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: LOVABLE_CLOUD_ANON_KEY,
    },
    body: JSON.stringify({
      platform,
      tone,
      goal,
      product_context: productContext,
      audience_context: audienceContext,
      model,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Generation failed" }));
    throw new Error(err.error || "Generation failed");
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {}
    }
  }

  onDone();
}

// ─── Conversations ───

export async function loadConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function createConversation(userId: string, title = "New Analysis"): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId);
  if (error) throw error;
}

// ─── Messages ───

export async function loadMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function saveMessageWithMetadata(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  metadata: Record<string, unknown>
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content, metadata: metadata as any })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

// ─── Website Profiles ───

export async function loadProfiles(conversationId: string): Promise<WebsiteProfile[]> {
  const { data, error } = await supabase
    .from("website_profiles")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as WebsiteProfile[];
}

export async function loadTasks(websiteProfileIds: string[]): Promise<ImprovementTask[]> {
  if (websiteProfileIds.length === 0) return [];
  const { data, error } = await supabase
    .from("improvement_tasks")
    .select("*")
    .in("website_profile_id", websiteProfileIds)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ImprovementTask[];
}

// ─── Delete old profiles for a conversation (via Edge Function) ───

export async function deleteProfilesForConversation(conversationId: string, accessToken: string): Promise<{ deletedProfiles: number; deletedTasks: number }> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/delete-profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ conversationId }),
  });

  const result = await resp.json();

  if (!resp.ok) {
    console.error("Delete profiles failed:", result);
    throw new Error(result.error || "Failed to delete profiles");
  }

  console.log(`Deleted ${result.deletedProfiles} profiles and ${result.deletedTasks} task groups for conversation ${conversationId}`);
  return { deletedProfiles: result.deletedProfiles, deletedTasks: result.deletedTasks };
}

// ─── Delete entire conversation (profiles, tasks, messages, conversation) ───

export async function deleteConversation(conversationId: string, accessToken: string): Promise<void> {
  // 1. Delete profiles + tasks via Edge Function
  try {
    await deleteProfilesForConversation(conversationId, accessToken);
  } catch (e) {
    console.warn("deleteProfilesForConversation failed (may have no profiles):", e);
  }

  // 2. Delete messages
  const { error: msgErr } = await supabase
    .from("messages")
    .delete()
    .eq("conversation_id", conversationId);
  if (msgErr) console.error("Failed to delete messages:", msgErr);

  // 3. Delete conversation
  const { error: convErr } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (convErr) throw convErr;
}

// ─── Analyze Website (Edge Function) ───

export async function analyzeWebsite(
  url: string,
  conversationId: string,
  isOwnWebsite: boolean,
  accessToken: string,
  model?: string,
  githubRepoUrl?: string
): Promise<{ profileId: string }> {
  const body: Record<string, unknown> = { url, conversationId, isOwnWebsite, model };
  if (githubRepoUrl) {
    body.githubRepoUrl = githubRepoUrl;
  }

  const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-website`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    const errorMsg = err.error || "Analysis failed";
    if (resp.status === 403) {
      throw new Error(errorMsg);
    }
    throw new Error(errorMsg);
  }

  return resp.json();
}


// ─── Add GitHub Analysis to existing profile ───

export async function addGithubAnalysis(
  profileId: string,
  githubRepoUrl: string,
  accessToken: string,
  model?: string
): Promise<{ success: boolean; codeAnalysis: Record<string, unknown> }> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/add-github-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ profileId, githubRepoUrl, model }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "GitHub analysis failed");
  }

  return resp.json();
}

// ─── Streaming Chat (Edge Function) ───

export async function streamChat({
  messages,
  conversationId,
  accessToken,
  model,
  onDelta,
  onDone,
  skipCredits,
}: {
  messages: { role: string; content: string }[];
  conversationId: string;
  accessToken: string;
  model?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  skipCredits?: boolean;
}) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages, conversationId, model, skipCredits }),
  });

  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: "Stream failed" }));
    const errorMsg = err.error || "Stream failed";
    throw new Error(errorMsg);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        // partial JSON, put back
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  onDone();
}

// ─── Find Competitors (Edge Function) ───

export async function findCompetitors(
  conversationId: string,
  accessToken: string
): Promise<{ competitors: { url: string; name: string; description: string }[] }> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/find-competitors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ conversationId }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Competitor search failed");
  }

  return resp.json();
}
