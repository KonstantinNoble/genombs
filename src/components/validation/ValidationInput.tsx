import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ModelSelector, ModelSelectorRef } from "./ModelSelector";
import { RiskShieldIcon, RiskBalanceIcon, RiskRocketIcon } from "./icons/RiskIcons";

interface ValidationInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  riskPreference: number;
  onRiskChange: (value: number) => void;
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  modelWeights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
  disabled?: boolean;
  isPremium?: boolean;
}

export type ValidationInputRef = ModelSelectorRef;

export const ValidationInput = forwardRef<ValidationInputRef, ValidationInputProps>(({
  prompt,
  onPromptChange,
  riskPreference,
  onRiskChange,
  selectedModels,
  onModelsChange,
  modelWeights,
  onWeightsChange,
  disabled = false,
  isPremium = false
}, ref) => {
  const getRiskLabel = (value: number) => {
    if (value <= 2) return "Conservative";
    if (value >= 4) return "Aggressive";
    return "Balanced";
  };

  const MAX_CHARACTERS = 500;
  const charactersRemaining = MAX_CHARACTERS - prompt.length;

  const handlePromptChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      onPromptChange(value);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Question Input - Enhanced Aesthetic */}
      <div className="group relative space-y-3 sm:space-y-4 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card via-background to-muted/30 border border-border/60 shadow-lg transition-all duration-500 hover:shadow-xl hover:border-primary/30">
        {/* Decorative Glow Effect */}
        <div className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <Label htmlFor="prompt" className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                Your Decision
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                What strategic question needs validation?
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold tabular-nums transition-all duration-300",
            charactersRemaining <= 50 
              ? 'bg-destructive/10 text-destructive border border-destructive/20' 
              : prompt.length > 0 
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground border border-border'
          )}>
            <span>{prompt.length}</span>
            <span className="text-muted-foreground/60">/</span>
            <span>{MAX_CHARACTERS}</span>
          </div>
        </div>
        
        {/* Enhanced Textarea */}
        <div className="relative">
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Should we expand into the European market this quarter?

Is hiring a dedicated CTO the right move for our stage?

Should we pivot our business model from B2C to B2B?"
            className={cn(
              "min-h-[140px] sm:min-h-[180px] text-base sm:text-lg resize-none leading-relaxed",
              "bg-background/80 border-2 border-border/50 rounded-xl",
              "placeholder:text-muted-foreground/40 placeholder:leading-relaxed",
              "focus:border-primary/40 focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
              "transition-all duration-300",
              prompt.length > 0 && "border-primary/20 bg-background"
            )}
            disabled={disabled}
            maxLength={MAX_CHARACTERS}
          />
          {/* Active Indicator */}
          {prompt.length > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-primary/70">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Ready to validate</span>
            </div>
          )}
        </div>
        
        {/* Helper Text */}
        <p className="text-sm text-muted-foreground leading-relaxed pl-1">
          Describe your business decision in detail. Our AI models will analyze it from multiple perspectives.
        </p>
      </div>

      {/* Model Selector */}
      <ModelSelector
        ref={ref}
        selectedModels={selectedModels}
        onModelsChange={onModelsChange}
        modelWeights={modelWeights}
        onWeightsChange={onWeightsChange}
        disabled={disabled}
        isPremium={isPremium}
      />

      {/* Risk Preference Slider with Custom Icons */}
      <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-muted/30 border">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base sm:text-lg font-semibold">Perspective Weighting</Label>
          <span className="text-sm sm:text-base font-bold text-primary px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 shrink-0">
            {getRiskLabel(riskPreference)}
          </span>
        </div>
        
        {/* Risk Icons Row */}
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex flex-col items-center gap-1">
            <RiskShieldIcon 
              size={32} 
              active={riskPreference <= 2}
              className="cursor-pointer"
            />
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference <= 2 ? "text-primary" : "text-muted-foreground"
            )}>
              Safe
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <RiskBalanceIcon 
              size={32} 
              active={riskPreference === 3}
              className="cursor-pointer"
            />
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference === 3 ? "text-primary" : "text-muted-foreground"
            )}>
              Balanced
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <RiskRocketIcon 
              size={32} 
              active={riskPreference >= 4}
              className="cursor-pointer"
            />
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference >= 4 ? "text-primary" : "text-muted-foreground"
            )}>
              Bold
            </span>
          </div>
        </div>

        <Slider
          value={[riskPreference]}
          onValueChange={([value]) => onRiskChange(value)}
          min={1}
          max={5}
          step={1}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
});

ValidationInput.displayName = 'ValidationInput';
