import { useState, useEffect, useCallback } from "react";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import CompetitorSuggestions from "./CompetitorSuggestions";
import type { CompetitorSuggestion } from "./CompetitorSuggestions";
import CustomerMapCard from "./CustomerMapCard";
import { Copy, Check, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const PLATFORM_LABELS: Record<string, string> = {
  reddit: "🟠 Reddit",
  linkedin: "🔵 LinkedIn",
  x: "🐦 X / Twitter",
  youtube: "🔴 YouTube",
  facebook: "📘 Facebook",
  discord: "💬 Discord",
  tiktok: "🎵 TikTok",
  quora: "❓ Quora",
  forum: "📝 Forum",
  cold_email: "✉️ Cold Email",
};

const ChatMessage = ({ message, onAnalyzeCompetitors, competitorAnalysisDisabled, maxCompetitorSelectable, onMetadataUpdate }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [pluginReady, setPluginReady] = useState(!!remarkGfmPlugin);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!remarkGfmPlugin && !pluginLoadAttempted) {
      loadRemarkGfm().then(() => setPluginReady(!!remarkGfmPlugin));
    }
  }, []);

  const plugins = remarkGfmPlugin ? [remarkGfmPlugin] : [];

  // Check for metadata types
  const metadata = message.metadata as Record<string, unknown> | null;
  const metadataType = metadata?.type as string | undefined;
  const isCompetitorSuggestions = metadataType === "competitor_suggestions";
  const isCustomerMap = metadataType === "customer_map";
  const isGeneratedPost = metadataType === "generated_post";
  const competitors = (metadata?.competitors as CompetitorSuggestion[]) || [];
  const initialSelectedUrls = (metadata?.selected_urls as string[]) || [];

  const handleCompetitorsSelected = useCallback(async (urls: string[]) => {
    const updatedMetadata = { ...metadata, selected_urls: urls };
    onMetadataUpdate?.(message.id, updatedMetadata);
    const { error } = await supabase
      .from("messages")
      .update({ metadata: updatedMetadata })
      .eq("id", message.id);
    if (error) {
      console.error("Failed to persist competitor selection:", error);
      toast.error("Failed to save selection. Please try again.");
    }
  }, [message.id, metadata, onMetadataUpdate]);

  const handleCopyPost = () => {
    const postContent = (metadata?.post_content as string) || message.content;
    navigator.clipboard.writeText(postContent);
    setCopied(true);
    toast.success("Post copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Render customer map from metadata
  if (isCustomerMap && metadata) {
    const cmData = metadata as any;
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-[78%]">
          <CustomerMapCard
            url={cmData.url || ""}
            productSummary={cmData.product_summary || ""}
            icp={cmData.icp || { demographics: {} }}
            communities={cmData.communities || []}
          />
          <p className="text-xs mt-2 text-muted-foreground/50">
            {new Date(message.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  // Render generated post from metadata
  if (isGeneratedPost && metadata) {
    const platform = metadata.platform as string;
    const postContent = (metadata.post_content as string) || message.content;
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-[78%] bg-card border-l-[3px] border-l-primary/60 border border-border/60 rounded-2xl rounded-bl-none px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Generated Post</span>
            </div>
            <div className="flex items-center gap-1.5">
              {platform && (
                <Badge variant="outline" className="text-[10px]">
                  {PLATFORM_LABELS[platform] || platform}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleCopyPost}>
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 prose prose-sm prose-invert max-w-none prose-p:text-foreground/90 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown remarkPlugins={plugins}>{postContent}</ReactMarkdown>
          </div>
          <p className="text-xs mt-2 text-muted-foreground/50">
            {new Date(message.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

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
