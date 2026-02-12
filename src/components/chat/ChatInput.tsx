import { useState, useEffect } from "react";
import { Send, Globe, Plus, ChevronDown, Lock } from "lucide-react";
import { GoogleIcon, OpenAIIcon, AnthropicIcon, PerplexityIcon } from "./ModelIcons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { isExpensiveModel, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS } from "@/lib/constants";

const AI_MODELS = [
  { id: "gemini-flash", label: "Gemini Flash", description: "Fast & efficient", icon: GoogleIcon },
  { id: "gpt-mini", label: "ChatGPT Mini", description: "Good value", icon: OpenAIIcon },
  { id: "gpt", label: "ChatGPT", description: "High accuracy", icon: OpenAIIcon },
  { id: "claude-sonnet", label: "Claude Sonnet", description: "Strong reasoning", icon: AnthropicIcon },
  { id: "perplexity", label: "Perplexity", description: "Web search powered", icon: PerplexityIcon },
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
  const { isPremium } = useAuth();
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-flash");
  const [modelOpen, setModelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");

  const maxUrlFields = isPremium ? PREMIUM_MAX_URL_FIELDS : FREE_MAX_URL_FIELDS;
  // Free users: own + 1 competitor = 2 fields total, so max 1 competitor field
  const maxCompetitorFields = maxUrlFields - 1;

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

  const competitorFields = [
    { label: "Competitor 1", value: comp1, set: setComp1 },
    { label: "Competitor 2", value: comp2, set: setComp2 },
    { label: "Competitor 3", value: comp3, set: setComp3 },
  ].slice(0, maxCompetitorFields);

  const competitorUrls = [comp1, comp2, comp3].slice(0, maxCompetitorFields).filter((u) => u.trim());
  const canStartAnalysis = ownUrl.trim() && competitorUrls.length > 0;

  const handleStartAnalysis = () => {
    if (!canStartAnalysis) return;
    onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel);
    setDialogOpen(false);
    setShowHint(false);
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
              <TooltipProvider>
                {AI_MODELS.map((model) => {
                  const Icon = model.icon;
                  const isActive = model.id === selectedModel;
                  const isLocked = !isPremium && isExpensiveModel(model.id);
                  return (
                    <Tooltip key={model.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (isLocked) return;
                            setSelectedModel(model.id);
                            setModelOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                            isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : isActive
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm flex items-center gap-1.5">
                              {model.label}
                              {isLocked && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/30 text-primary">
                                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">{model.description}</div>
                          </div>
                        </button>
                      </TooltipTrigger>
                      {isLocked && (
                        <TooltipContent side="right">
                          <p className="text-xs">Upgrade to Premium to use {model.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
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
            {competitorFields.map((field) => (
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
            {!isPremium && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Upgrade to Premium for up to 3 competitor URLs
              </p>
            )}
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
