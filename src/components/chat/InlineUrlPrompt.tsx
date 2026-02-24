import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Lock, Github, Code, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { isExpensiveModel, getAnalysisCreditCost, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS, COMPETITOR_SEARCH_COST } from "@/lib/constants";

interface InlineUrlPromptProps {
  onStartAnalysis: (ownUrl: string, competitorUrls: string[], model: string, githubRepoUrl?: string, autoFindCompetitors?: boolean) => void;
  onGithubOnlyAnalysis?: (githubUrl: string, model: string) => void;
  selectedModel: string;
}

const InlineUrlPrompt = ({ onStartAnalysis, onGithubOnlyAnalysis, selectedModel }: InlineUrlPromptProps) => {
  const { isPremium, remainingCredits } = useAuth();
  const navigate = useNavigate();
  const URL_MAX_LENGTH = 100;
  const GITHUB_MAX_LENGTH = 150;

  const [mode, setMode] = useState<"website" | "code">("website");
  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [autoFind, setAutoFind] = useState(false);

  const isValidUrl = (url: string) => {
    const trimmed = url.trim();
    return trimmed.startsWith("https://") && trimmed.includes(".");
  };

  const isValidGithubUrl = (url: string) => {
    if (!url.trim()) return true;
    return /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(url.trim());
  };

  const maxCompetitorFields = PREMIUM_MAX_URL_FIELDS - 1;
  const costPerUrl = getAnalysisCreditCost(selectedModel);
  const affordableUrls = costPerUrl > 0 ? Math.floor(remainingCredits / costPerUrl) : 0;
  const effectiveMaxFields = Math.min(isPremium ? PREMIUM_MAX_URL_FIELDS : FREE_MAX_URL_FIELDS, affordableUrls);
  const effectiveCompetitorFields = Math.max(0, effectiveMaxFields - 1);
  const isOwnUrlDisabled = affordableUrls < 1;

  const competitorFields = [
    { label: "Competitor 1", value: comp1, set: setComp1 },
    { label: "Competitor 2", value: comp2, set: setComp2 },
    { label: "Competitor 3", value: comp3, set: setComp3 },
  ].slice(0, maxCompetitorFields);

  const competitorUrls = autoFind ? [] : [comp1, comp2, comp3].slice(0, effectiveCompetitorFields).filter((u) => u.trim());
  const allUrlsValid = isValidUrl(ownUrl) && competitorUrls.every((u) => isValidUrl(u)) && (mode === "code" ? isValidGithubUrl(githubUrl) : true);
  const canAffordAutoFind = autoFind ? remainingCredits >= (costPerUrl + COMPETITOR_SEARCH_COST) : true;
  const canStartAnalysis = affordableUrls >= 1 && canAffordAutoFind && ownUrl.trim() && (autoFind || competitorUrls.length > 0) && allUrlsValid;

  const canStartGithubOnly = githubUrl.trim() && isValidGithubUrl(githubUrl) && !isValidGithubUrl("") && onGithubOnlyAnalysis;

  const handleStart = () => {
    if (!canStartAnalysis) return;
    const ghUrl = undefined;
    onStartAnalysis(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel, ghUrl, autoFind);
  };

  const handleGithubOnly = () => {
    if (!canStartGithubOnly) return;
    onGithubOnlyAnalysis!(githubUrl.trim(), selectedModel);
  };

  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 max-w-md w-full space-y-4">
        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setMode("website")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "website"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website Analysis
          </button>
          <button
            onClick={() => setMode("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Code Analysis
          </button>
        </div>

        {mode === "website" ? (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your website URL{!autoFind ? " and at least one competitor" : ""} to start the analysis.
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              💡 The website URL is used for live performance &amp; SEO analysis.
            </p>

            {/* Own URL */}
            <div className={`space-y-1.5 ${isOwnUrlDisabled ? "opacity-50" : ""}`}>
              <Label className="text-xs font-medium flex items-center gap-1.5">
                Your Website
                {isOwnUrlDisabled && <Lock className="w-3 h-3 text-muted-foreground" />}
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={ownUrl}
                  onChange={(e) => setOwnUrl(e.target.value.slice(0, URL_MAX_LENGTH))}
                  placeholder="https://your-site.com"
                  className="pl-9 h-9 text-sm"
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
                      <Label className="text-xs font-medium flex items-center gap-1.5">
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
                          className="pl-9 h-9 text-sm"
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
                    className="text-[11px] text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate("/pricing")}
                  >
                    <Lock className="w-3 h-3" />
                    Upgrade to Premium to analyze up to 4 URLs at once
                  </p>
                )}
              </>
            )}

            <Button
              onClick={handleStart}
              disabled={!canStartAnalysis}
              className="w-full"
              size="sm"
            >
              {autoFind ? "Scan & Find Competitors" : "Start Analysis"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter a public GitHub repository URL to analyze the source code.
            </p>
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              💡 The code analysis evaluates code quality, architecture, security patterns, and provides actionable improvement suggestions.
            </p>

            {/* GitHub URL for code-only mode */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                GitHub Repository
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value.slice(0, GITHUB_MAX_LENGTH))}
                  placeholder="https://github.com/user/repo"
                  className="pl-9 h-9 text-sm"
                  maxLength={GITHUB_MAX_LENGTH}
                />
              </div>
              {githubUrl.trim() && !isValidGithubUrl(githubUrl) && (
                <p className="text-[11px] text-destructive">Must be a valid GitHub URL (https://github.com/owner/repo)</p>
              )}
              {githubUrl.trim() && isValidGithubUrl(githubUrl) && (
                <p className="text-[11px] text-chart-6">✓ Valid GitHub URL</p>
              )}
            </div>

            <Button
              onClick={handleGithubOnly}
              disabled={!canStartGithubOnly}
              className="w-full"
              size="sm"
            >
              <Github className="w-3.5 h-3.5 mr-1.5" />
              Analyze Code
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InlineUrlPrompt;
