import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { isExpensiveModel, getAnalysisCreditCost, FREE_MAX_URL_FIELDS, PREMIUM_MAX_URL_FIELDS } from "@/lib/constants";

interface InlineUrlPromptProps {
  onStartAnalysis: (ownUrl: string, competitorUrls: string[], model: string) => void;
  selectedModel: string;
}

const InlineUrlPrompt = ({ onStartAnalysis, selectedModel }: InlineUrlPromptProps) => {
  const { isPremium, remainingCredits } = useAuth();
  const navigate = useNavigate();
  const URL_MAX_LENGTH = 100;

  const [ownUrl, setOwnUrl] = useState("");
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [comp3, setComp3] = useState("");

  const isValidUrl = (url: string) => {
    const trimmed = url.trim();
    return trimmed.startsWith("https://") && trimmed.includes(".");
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

  const competitorUrls = [comp1, comp2, comp3].slice(0, effectiveCompetitorFields).filter((u) => u.trim());
  const allUrlsValid = isValidUrl(ownUrl) && competitorUrls.every((u) => isValidUrl(u));
  const canStartAnalysis = affordableUrls >= 1 && ownUrl.trim() && competitorUrls.length > 0 && allUrlsValid;

  const handleStart = () => {
    if (!canStartAnalysis) return;
    onStartAnalysis(ownUrl.trim(), competitorUrls.map((u) => u.trim()), selectedModel);
  };

  return (
    <div className="flex justify-start">
      <div className="bg-card border border-border rounded-2xl rounded-bl-md px-5 py-4 max-w-md w-full space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="w-4 h-4 text-primary" />
          <span>Please enter your website URL and at least one competitor to get started.</span>
        </div>

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

        {/* Competitor fields */}
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

        <Button
          onClick={handleStart}
          disabled={!canStartAnalysis}
          className="w-full"
          size="sm"
        >
          Start Analysis
        </Button>
      </div>
    </div>
  );
};

export default InlineUrlPrompt;
