/**
 * API client for all chat-related backend calls.
 * Uses the external Supabase project.
 */
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/external-client";
import type { Conversation, Message, WebsiteProfile, ImprovementTask } from "@/types/chat";

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
  model?: string
): Promise<{ profileId: string }> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-website`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ url, conversationId, isOwnWebsite, model }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Analysis failed");
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
}: {
  messages: { role: string; content: string }[];
  conversationId: string;
  accessToken: string;
  model?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ messages, conversationId, model }),
  });

  if (!resp.ok || !resp.body) {
    const err = await resp.json().catch(() => ({ error: "Stream failed" }));
    throw new Error(err.error || "Stream failed");
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
