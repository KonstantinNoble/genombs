import { useState, useEffect } from "react";
import type { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
}

// Dynamisch laden, da remark-gfm auf alten mobilen Browsern crasht
// (Named Capture Groups in Regex werden nicht unterstuetzt)
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

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [pluginReady, setPluginReady] = useState(!!remarkGfmPlugin);

  useEffect(() => {
    if (!remarkGfmPlugin && !pluginLoadAttempted) {
      loadRemarkGfm().then(() => setPluginReady(!!remarkGfmPlugin));
    }
  }, []);

  const plugins = remarkGfmPlugin ? [remarkGfmPlugin] : [];

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-card-foreground rounded-bl-md"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-td:text-muted-foreground prose-th:text-foreground prose-a:text-primary">
            <ReactMarkdown remarkPlugins={plugins}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}>
          {new Date(message.created_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
