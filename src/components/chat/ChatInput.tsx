import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Globe, Plus, ChevronDown, Lock } from "lucide-react";
import { toast } from "sonner";
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
import { isExpensiveModel, getAnalysisCreditCost, getChatCreditCost, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS } from "@/lib/constants";

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
  onPromptUrl?: (message: string) => void;
  disabled?: boolean;
  hasProfiles?: boolean;
  initialOwnUrl?: string;
  initialCompetitorUrls?: string[];
}

const ChatInput = ({ onSend, onScan, onClearUrls, onPromptUrl, disabled, hasProfiles = true, initialOwnUrl, initialCompetitorUrls }: ChatInputProps) => {
  const { isPremium, remainingCredits } = useAuth();
  const navigate = useNavigate();
  const CHAT_MAX_LENGTH = 300;
  const URL_MAX_LENGTH = 100;
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-flash");
  const [modelOpen, setModelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");


  // Auto-switch to cheapest affordable model if current becomes unaffordable
  useEffect(() => {
    const cost = getChatCreditCost(selectedModel);
    if (remainingCredits < cost) {
      const affordable = AI_MODELS.find(
        (m) => (isPremium || !isExpensiveModel(m.id)) && remainingCredits >= getChatCreditCost(m.id)
      );
      if (affordable) setSelectedModel(affordable.id);
    }
  }, [remainingCredits, selectedModel, isPremium]);

  // Always show all 4 fields (own + 3 competitors), but lock premium-only ones for free users
  const maxUrlFields = PREMIUM_MAX_URL_FIELDS; // always show all 4
  const maxCompetitorFields = maxUrlFields - 1; // always 3

  // Credit-based URL field locking
  const costPerUrl = getAnalysisCreditCost(selectedModel);
  const affordableUrls = costPerUrl > 0 ? Math.floor(remainingCredits / costPerUrl) : 0;
  const effectiveMaxFields = Math.min(isPremium ? PREMIUM_MAX_URL_FIELDS : FREE_MAX_URL_FIELDS, affordableUrls);
  const effectiveCompetitorFields = Math.max(0, effectiveMaxFields - 1);
  const notEnoughCredits = affordableUrls < maxUrlFields;

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

  const isValidUrl = (url: string) => {
    const trimmed = url.trim();
    return trimmed.startsWith("https://") && trimmed.includes(".");
  };

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) ?? AI_MODELS[0];
  const chatCost = getChatCreditCost(selectedModel);
  const notEnoughForChat = remainingCredits < chatCost;

  const handleSend = () => {
    if (!value.trim()) return;
    if (!hasProfiles) {
      onPromptUrl?.(value.trim());
      setValue("");
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

  const competitorUrls = [comp1, comp2, comp3].slice(0, effectiveCompetitorFields).filter((u) => u.trim());
  const allUrlsValid = isValidUrl(ownUrl) && competitorUrls.every((u) => isValidUrl(u));
  const canStartAnalysis = affordableUrls >= 1 && ownUrl.trim() && competitorUrls.length > 0 && allUrlsValid;
  
  const isOwnUrlDisabled = affordableUrls < 1;

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
                  const modelChatCost = getChatCreditCost(model.id);
                  const noCredits = !isLocked && remainingCredits < modelChatCost;
                  const isDisabled = isLocked || noCredits;
                  return (
                    <Tooltip key={model.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (isDisabled) return;
                            setSelectedModel(model.id);
                            setModelOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                            isDisabled
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
                              {noCredits && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-destructive/30 text-destructive">
                                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                                  {modelChatCost} Credits
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
                      {noCredits && (
                        <TooltipContent side="right">
                          <p className="text-xs">Not enough credits ({modelChatCost} needed)</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </TooltipProvider>
            </PopoverContent>
          </Popover>

          <div className="relative flex-1">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, CHAT_MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Enter a URL or ask a question..."
              className="min-h-[44px] max-h-[120px] resize-none bg-background"
              maxLength={CHAT_MAX_LENGTH}
              rows={1}
              disabled={disabled}
            />
            <span className="absolute right-2 bottom-1 text-[10px] text-muted-foreground/50">
              {value.length}/{CHAT_MAX_LENGTH}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    onClick={() => {
                      if (remainingCredits < costPerUrl) {
                        toast.error("Not enough credits for analysis.");
                        return;
                      }
                      setDialogOpen(true);
                    }}
                    disabled={disabled}
                    size="icon"
                    variant="outline"
                    className="shrink-0 h-[44px] w-[44px]"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {remainingCredits < costPerUrl && (
                <TooltipContent>
                  <p className="text-xs">Not enough credits for analysis</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={() => {
              if (notEnoughForChat) {
                toast.error("Not enough credits to send a message.");
                return;
              }
              handleSend();
            }}
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
            <div className={`space-y-1.5 ${isOwnUrlDisabled ? "opacity-50" : ""}`}>
              <Label htmlFor="own-url" className="text-sm font-medium flex items-center gap-1.5">
                Your Website
                {isOwnUrlDisabled && <Lock className="w-3 h-3 text-muted-foreground" />}
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="own-url"
                  value={ownUrl}
                  onChange={(e) => setOwnUrl(e.target.value.slice(0, URL_MAX_LENGTH))}
                  placeholder="https://your-site.com"
                  className="pl-9"
                  maxLength={URL_MAX_LENGTH}
                  disabled={isOwnUrlDisabled}
                />
              </div>
              {ownUrl.trim() && !isValidUrl(ownUrl) && (
                <p className="text-[11px] text-destructive">URL must start with https:// and contain a dot</p>
              )}
            </div>
            {competitorFields.map((field, index) => {
              const fieldIndex = index + 1; // 0 = own website, so competitors start at 1
              const isPremiumLocked = !isPremium && fieldIndex >= FREE_MAX_URL_FIELDS;
              const isCreditLocked = !isPremiumLocked && fieldIndex >= effectiveMaxFields;
              const isFieldDisabled = isPremiumLocked || isCreditLocked;
              return (
                <div
                  key={field.label}
                  className={`space-y-1.5 ${isFieldDisabled ? "opacity-50" : ""} ${isPremiumLocked ? "cursor-pointer" : ""}`}
                  onClick={isPremiumLocked ? () => navigate("/pricing") : undefined}
                >
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    {field.label}
                    {isPremiumLocked && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary/30 text-primary">
                        <Lock className="w-2.5 h-2.5 mr-0.5" />
                        Premium
                      </Badge>
                    )}
                    {isCreditLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={field.value}
                      onChange={(e) => field.set(e.target.value.slice(0, URL_MAX_LENGTH))}
                      placeholder={isPremiumLocked ? "Premium only" : `https://${field.label.toLowerCase().replace(" ", "")}.com`}
                      className="pl-9"
                      maxLength={URL_MAX_LENGTH}
                      disabled={isFieldDisabled}
                    />
                  </div>
                  {field.value.trim() && !isValidUrl(field.value) && (
                    <p className="text-[11px] text-destructive">URL must start with https:// and contain a dot</p>
                  )}
                </div>
              );
            })}
            {!isPremium && (
              <p
                className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                onClick={() => navigate("/pricing")}
              >
                <Lock className="w-3 h-3" />
                Upgrade to Premium to analyze up to 4 URLs at once
              </p>
            )}
            {notEnoughCredits && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Not enough credits to analyze more URLs. You need {costPerUrl} credits per URL.
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
