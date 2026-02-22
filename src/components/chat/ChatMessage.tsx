import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import CompetitorSuggestions from "./CompetitorSuggestions";
import type { CompetitorSuggestion } from "./CompetitorSuggestions";

interface ChatMessageProps {
  message: Message;
  onAnalyzeCompetitors?: (urls: string[]) => void;
  competitorAnalysisDisabled?: boolean;
  maxCompetitorSelectable?: number;
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

const ChatMessage = ({ message, onAnalyzeCompetitors, competitorAnalysisDisabled, maxCompetitorSelectable }: ChatMessageProps) => {
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

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[78%] text-sm leading-relaxed ${isUser
          ? "bg-secondary text-foreground rounded-xl rounded-br-sm px-4 py-3"
          : "bg-card border-l-2 border-l-primary/50 border border-border/60 text-card-foreground rounded-xl rounded-bl-none px-4 py-3"
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
            />
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-td:text-muted-foreground prose-th:text-foreground prose-a:text-primary">
            <ReactMarkdown remarkPlugins={plugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className="font-mono text-[10px] mt-2 text-muted-foreground/40 tracking-wide">
          {new Date(message.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
