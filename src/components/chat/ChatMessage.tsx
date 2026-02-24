import { useState, useEffect, useCallback } from "react";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import CompetitorSuggestions from "./CompetitorSuggestions";
import type { CompetitorSuggestion } from "./CompetitorSuggestions";
import { supabase } from "@/lib/supabase/external-client";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  onAnalyzeCompetitors?: (urls: string[]) => void;
  competitorAnalysisDisabled?: boolean;
  maxCompetitorSelectable?: number;
  onMetadataUpdate?: (messageId: string, metadata: Record<string, unknown>) => void;
}

// Dynamisch laden, da remark-gfm auf alten mobilen Browsern crasht
let remarkGfmPlugin: any = null;
let pluginLoadAttempted = false;

const loadRemarkGfm = async () => {
  if (pluginLoadAttempted) return;
  pluginLoadAttempted = true;
  try {
    const mod = await import("remark-gfm");
    remarkGfmPlugin = mod.default;
  } catch (e) {
    console.warn("remark-gfm not supported on this browser:", e);
  }
};

const ChatMessage = ({ message, onAnalyzeCompetitors, competitorAnalysisDisabled, maxCompetitorSelectable, onMetadataUpdate }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [pluginReady, setPluginReady] = useState(!!remarkGfmPlugin);

  useEffect(() => {
    if (!remarkGfmPlugin && !pluginLoadAttempted) {
      loadRemarkGfm().then(() => setPluginReady(!!remarkGfmPlugin));
    }
  }, []);

  const plugins = remarkGfmPlugin ? [remarkGfmPlugin] : [];

  // Check for competitor suggestions metadata
  const metadata = message.metadata as Record<string, unknown> | null;
  const isCompetitorSuggestions = metadata?.type === "competitor_suggestions";
  const competitors = (metadata?.competitors as CompetitorSuggestion[]) || [];
  const initialSelectedUrls = (metadata?.selected_urls as string[]) || [];

  const handleCompetitorsSelected = useCallback(async (urls: string[]) => {
    const updatedMetadata = { ...metadata, selected_urls: urls };
    // Optimistic: patch parent state immediately so card stays closed
    onMetadataUpdate?.(message.id, updatedMetadata);
    // Persist to DB
    const { error } = await supabase
      .from("messages")
      .update({ metadata: updatedMetadata })
      .eq("id", message.id);
    if (error) {
      console.error("Failed to persist competitor selection:", error);
      toast.error("Failed to save selection. Please try again.");
    }
  }, [message.id, metadata, onMetadataUpdate]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[78%] text-[15px] leading-7 ${isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-5 py-3.5"
            : "bg-card border-l-[3px] border-l-primary/60 border border-border/60 text-card-foreground rounded-2xl rounded-bl-none px-5 py-4"
          }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : isCompetitorSuggestions && competitors.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{message.content}</p>
            <CompetitorSuggestions
              competitors={competitors}
              onAnalyze={(urls) => onAnalyzeCompetitors?.(urls)}
              disabled={competitorAnalysisDisabled}
              maxSelectable={maxCompetitorSelectable}
              initialSelectedUrls={initialSelectedUrls}
              onSelected={handleCompetitorsSelected}
            />
          </div>
        ) : (
          <div className="prose prose-invert prose-base max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-td:text-muted-foreground prose-th:text-foreground prose-a:text-primary">
            <ReactMarkdown remarkPlugins={plugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className="text-xs mt-2 text-muted-foreground/50">
          {new Date(message.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
