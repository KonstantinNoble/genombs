import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Globe, Plus, ChevronDown, Lock, Github, Search } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon, OpenAIIcon, AnthropicIcon, PerplexityIcon } from "./ModelIcons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { isExpensiveModel, getAnalysisCreditCost, getChatCreditCost, getCodeAnalysisCreditCost, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS, COMPETITOR_SEARCH_COST } from "@/lib/constants";

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
  onScan?: (ownUrl: string, competitorUrls: string[], model: string, repo?: string, autoFindCompetitors?: boolean) => void | Promise<void>;
  onGithubAnalysis?: (githubUrl: string, model?: string) => void;
  onClearUrls?: () => void;
  onPromptUrl?: (message: string) => void;
  disabled?: boolean;
  hasProfiles?: boolean;
  hasOwnProfile?: boolean;
  initialOwnUrl?: string;
  initialCompetitorUrls?: string[];
  externalDialogOpen?: boolean;
  onExternalDialogChange?: (open: boolean) => void;
  externalGithubOpen?: boolean;
  onExternalGithubChange?: (open: boolean) => void;
}

const ChatInput = ({ onSend, onScan, onGithubAnalysis, onClearUrls, onPromptUrl, disabled, hasProfiles = true, hasOwnProfile = false, initialOwnUrl, initialCompetitorUrls, externalDialogOpen, onExternalDialogChange, externalGithubOpen, onExternalGithubChange }: ChatInputProps) => {
  const { isPremium, remainingCredits } = useAuth();
  const navigate = useNavigate();
  const CHAT_MAX_LENGTH = 300;
  const URL_MAX_LENGTH = 100;
  const GITHUB_MAX_LENGTH = 150;
  const [value, setValue] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("gemini-flash");
  const [modelOpen, setModelOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [githubPopoverOpen, setGithubPopoverOpen] = useState(false);
  const [githubInput, setGithubInput] = useState("");
  const [showHint, setShowHint] = useState(false);

  // Sync external dialog open triggers
  useEffect(() => {
    if (externalDialogOpen) {
      setDialogOpen(true);
      onExternalDialogChange?.(false);
    }
  }, [externalDialogOpen]);

  useEffect(() => {
    if (externalGithubOpen) {
      setGithubPopoverOpen(true);
      onExternalGithubChange?.(false);
    }
  }, [externalGithubOpen]);
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");
  const [autoFind, setAutoFind] = useState(false);


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

  const competitorUrls = autoFind ? [] : [comp1, comp2, comp3].slice(0, effectiveCompetitorFields).filter((u) => u.trim());
  const allUrlsValid = isValidUrl(ownUrl) && competitorUrls.every((u) => isValidUrl(u));
  const canStartAnalysis = affordableUrls >= 1 && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;

  const isOwnUrlDisabled = affordableUrls < 1;

  const handleStartAnalysis = () => {
    if (!canStartAnalysis) return;
    onScan?.(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel, undefined, autoFind);
    setDialogOpen(false);
    setShowHint(false);
    setOwnUrl("");
    setComp1("");
    setComp2("");
    setComp3("");
    setAutoFind(false);
    onClearUrls?.();
  };

  return (
    <>
      <div className="border-t border-border/60 bg-card px-4 py-3">
        {/* Unified input card */}
        <div className="rounded-xl border border-border/70 bg-background shadow-sm focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          {/* Textarea row */}
          <div className="relative px-4 pt-3 pb-2">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, CHAT_MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question or enter a URL..."
              className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0 text-[15px] leading-relaxed placeholder:text-muted-foreground/40"
              maxLength={CHAT_MAX_LENGTH}
              rows={2}
              disabled={disabled}
            />
            <span className="absolute right-4 bottom-2 text-[10px] font-mono text-muted-foreground/30 select-none">
              {value.length}/{CHAT_MAX_LENGTH}
            </span>
          </div>

          {/* Toolbar row */}
          <div className="flex items-center gap-1.5 px-3 pb-3 pt-1 border-t border-border/40">
            {/* Model Selector */}
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  className="shrink-0 h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg"
                >
                  <currentModel.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-medium">{currentModel.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-40" />
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
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${isDisabled
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

            {/* Divider */}
            <div className="w-px h-5 bg-border/60 mx-0.5" />

            {/* Add URLs button */}
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
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add URLs</span>
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

            {/* GitHub button */}
            {(() => {
              const codeAnalysisCost = getCodeAnalysisCreditCost(selectedModel);
              const notEnoughForCode = remainingCredits < codeAnalysisCost;
              return (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="shrink-0 h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg"
                    title="Add GitHub repo for Deep Analysis"
                    onClick={() => setGithubPopoverOpen(true)}
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">GitHub</span>
                  </Button>
                  <Dialog open={githubPopoverOpen} onOpenChange={setGithubPopoverOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Deep Code Analysis</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-2">
                        <p className="text-sm text-muted-foreground">
                          Add a public GitHub repo to run a Deep Code Analysis on your website's source code.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Costs <span className="font-semibold text-foreground">{codeAnalysisCost} credits</span> with {currentModel.label}
                        </p>
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">GitHub Repository URL</Label>
                          <Input
                            value={githubInput}
                            onChange={(e) => setGithubInput(e.target.value.slice(0, GITHUB_MAX_LENGTH))}
                            placeholder="https://github.com/user/repo"
                            className="text-sm"
                            maxLength={GITHUB_MAX_LENGTH}
                          />
                        </div>
                        {githubInput.trim() && !(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(githubInput.trim())) && (
                          <p className="text-[11px] text-destructive">Must be a valid GitHub URL (https://github.com/owner/repo)</p>
                        )}
                        {githubInput.trim() && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(githubInput.trim()) && (
                          <p className="text-[11px] text-chart-6">✓ Valid GitHub URL</p>
                        )}
                        {notEnoughForCode && (
                          <p className="text-[11px] text-destructive">Not enough credits ({codeAnalysisCost} needed, {remainingCredits} remaining)</p>
                        )}
                        <Button
                          className="w-full mt-2"
                          disabled={notEnoughForCode || !githubInput.trim() || !(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(githubInput.trim()))}
                          onClick={() => {
                            onGithubAnalysis?.(githubInput.trim(), selectedModel);
                            setGithubInput("");
                            setGithubPopoverOpen(false);
                          }}
                        >
                          Start Deep Analysis ({codeAnalysisCost} Credits)
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              );
            })()}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Send button */}
            <Button
              onClick={() => {
                if (notEnoughForChat) {
                  toast.error("Not enough credits to send a message.");
                  return;
                }
                handleSend();
              }}
              disabled={!value.trim() || disabled}
              size="sm"
              className="shrink-0 h-8 gap-1.5 px-4 text-sm rounded-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
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
          <p className="text-sm text-muted-foreground">
            Costs <span className="font-semibold text-foreground">{costPerUrl} credits per URL</span> with {currentModel.label}
          </p>
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
            {/* Auto-find toggle */}
            <div
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border bg-muted/30 cursor-pointer"
              onClick={() => setAutoFind(!autoFind)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium text-foreground">Find competitors automatically with AI</span>
                <span className="text-[10px] text-muted-foreground shrink-0">(+{COMPETITOR_SEARCH_COST} Credits)</span>
              </div>
              <Switch
                checked={autoFind}
                onCheckedChange={setAutoFind}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
            </div>

            {/* Competitor fields - hidden when autoFind is active */}
            {!autoFind && (
              <>
                {competitorFields.map((field, index) => {
                  const fieldIndex = index + 1;
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
              </>
            )}
            <Button
              onClick={handleStartAnalysis}
              disabled={!canStartAnalysis}
              className="w-full mt-2"
            >
              {autoFind ? "Scan & Find Competitors" : "Start Analysis"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
    </>
  );
};

export default ChatInput;
