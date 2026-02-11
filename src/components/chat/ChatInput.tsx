import { useState, useEffect } from "react";
import { Send, Globe, Plus, Sparkles, Bot, Search, ChevronDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const AI_MODELS = [
  { id: "gemini-flash", label: "Gemini Flash", description: "Fast & efficient", icon: Sparkles },
  { id: "gpt-mini", label: "ChatGPT Mini", description: "Good value", icon: Bot },
  { id: "gpt", label: "ChatGPT", description: "High accuracy", icon: Bot },
  { id: "claude-sonnet", label: "Claude Sonnet", description: "Strong reasoning", icon: Bot },
  { id: "perplexity", label: "Perplexity", description: "Web search powered", icon: Search },
] as const;

type ModelId = (typeof AI_MODELS)[number]["id"];

interface ChatInputProps {
  onSend: (message: string, model: string) => void;
  onScan?: (ownUrl: string, competitorUrls: string[], model: string) => void;
  onClearUrls?: () => void;
  disabled?: boolean;
  hasProfiles?: boolean;
  initialOwnUrl?: string;
  initialCompetitorUrls?: string[];
}

const ChatInput = ({ onSend, onScan, onClearUrls, disabled, hasProfiles = true, initialOwnUrl, initialCompetitorUrls }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-flash");
  const [modelOpen, setModelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");

  // Sync initial URLs from props (loaded from profiles)
  useEffect(() => {
    if (initialOwnUrl !== undefined) setOwnUrl(initialOwnUrl);
  }, [initialOwnUrl]);

  useEffect(() => {
    if (initialCompetitorUrls) {
      setComp1(initialCompetitorUrls[0] ?? "");
      setComp2(initialCompetitorUrls[1] ?? "");
      setComp3(initialCompetitorUrls[2] ?? "");
    }
  }, [initialCompetitorUrls]);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel)!;

  const handleSend = () => {
    if (!value.trim()) return;
    if (!hasProfiles) {
      setShowHint(true);
      setDialogOpen(true);
      return;
    }
    onSend(value.trim(), selectedModel);
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
    onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel);
    setDialogOpen(false);
    setShowHint(false);
    // Clear URLs after starting analysis
    setOwnUrl("");
    setComp1("");
    setComp2("");
    setComp3("");
    onClearUrls?.();
  };

  return (
    <div className="border-t border-border bg-card">
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Model Selector */}
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled}
                className="shrink-0 h-[44px] gap-1.5 px-3 text-xs"
              >
                <currentModel.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{currentModel.label}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1">
              {AI_MODELS.map((model) => {
                const Icon = model.icon;
                const isActive = model.id === selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setModelOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{model.label}</div>
                      <div className="text-[11px] text-muted-foreground">{model.description}</div>
                    </div>
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>

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
