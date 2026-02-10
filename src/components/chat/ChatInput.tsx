import { useState } from "react";
import { Send, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const URL_REGEX = /https?:\/\/[^\s]+/;

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const detectedUrl = value.match(URL_REGEX)?.[0] || null;

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      {detectedUrl && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-secondary/50 border border-border px-3 py-2 text-xs text-muted-foreground">
          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">
            URL detected: <span className="text-foreground font-medium">{detectedUrl}</span> — will be analyzed
          </span>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a URL or ask a question..."
          className="min-h-[44px] max-h-[120px] resize-none bg-background"
          rows={1}
          disabled={disabled}
        />
        <Button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className="shrink-0 h-[44px] w-[44px]"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
