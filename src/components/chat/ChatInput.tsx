import { useState } from "react";
import { Send, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatInputProps {
  onSend: (message: string) => void;
  onScan?: (url: string, type: "own" | "competitor") => void;
  disabled?: boolean;
}

const URL_REGEX = /https?:\/\/[^\s]+/;

const ChatInput = ({ onSend, onScan, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleScanClick = () => {
    if (!scanUrl.trim()) return;
    setDialogOpen(true);
  };

  const handleScanType = (type: "own" | "competitor") => {
    onScan?.(scanUrl.trim(), type);
    setDialogOpen(false);
    setScanUrl("");
  };

  // Extract domain for display in dialog
  const displayDomain = (() => {
    try {
      const url = scanUrl.trim().startsWith("http") ? scanUrl.trim() : `https://${scanUrl.trim()}`;
      return new URL(url).hostname;
    } catch {
      return scanUrl.trim();
    }
  })();

  return (
    <div className="border-t border-border bg-card">
      {/* Chat input area */}
      <div className="p-4 pb-2">
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

      {/* URL Scanner bar */}
      <div className="px-4 pb-3 pt-1">
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2">
          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            placeholder="Enter website URL..."
            className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleScanClick();
              }
            }}
          />
          <Button
            onClick={handleScanClick}
            disabled={!scanUrl.trim()}
            size="sm"
            variant="secondary"
            className="shrink-0 gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Scan
          </Button>
        </div>
      </div>

      {/* Scan type dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan Website</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground truncate">{displayDomain}</p>
          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={() => handleScanType("own")} className="w-full">
              Scan Your Site
            </Button>
            <Button onClick={() => handleScanType("competitor")} variant="secondary" className="w-full">
              Scan Competitor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInput;
