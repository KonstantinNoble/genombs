import { useState } from "react";
import { Send, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatInputProps {
  onSend: (message: string) => void;
  onScan?: (ownUrl: string, competitorUrls: string[]) => void;
  disabled?: boolean;
  hasProfiles?: boolean;
}

const ChatInput = ({ onSend, onScan, disabled, hasProfiles = true }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    if (!hasProfiles) {
      setShowHint(true);
      setDialogOpen(true);
      return;
    }
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const competitorUrls = [comp1, comp2, comp3].filter((u) => u.trim());
  const canStartAnalysis = ownUrl.trim() && competitorUrls.length > 0;

  const handleStartAnalysis = () => {
    if (!canStartAnalysis) return;
    onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()));
    setDialogOpen(false);
    setShowHint(false);
    setOwnUrl("");
    setComp1("");
    setComp2("");
    setComp3("");
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="p-4">
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
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            size="icon"
            variant="outline"
            className="shrink-0 h-[44px] w-[44px]"
          >
            <Plus className="w-4 h-4" />
          </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Websites to Analyze</DialogTitle>
            {showHint && (
              <p className="text-sm text-muted-foreground mt-1">
                To get started, add your website and at least one competitor.
              </p>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="own-url" className="text-sm font-medium">Your Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="own-url"
                  value={ownUrl}
                  onChange={(e) => setOwnUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  className="pl-9"
                />
              </div>
            </div>
            {[
              { label: "Competitor 1", value: comp1, set: setComp1 },
              { label: "Competitor 2", value: comp2, set: setComp2 },
              { label: "Competitor 3", value: comp3, set: setComp3 },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label className="text-sm font-medium">{field.label}</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={`https://${field.label.toLowerCase().replace(" ", "")}.com`}
                    className="pl-9"
                  />
                </div>
              </div>
            ))}
            <Button
              onClick={handleStartAnalysis}
              disabled={!canStartAnalysis}
              className="w-full mt-2"
            >
              Start Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInput;
