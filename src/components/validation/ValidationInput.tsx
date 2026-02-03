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
          <div>
            <Label htmlFor="prompt" className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Your Decision
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              What strategic question needs validation?
            </p>
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
        
        {/* Enhanced Textarea with Permanent Green Glow */}
        <div className="relative">
          {/* Permanent Green Glow Effect */}
          <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500/40 via-green-400/30 to-emerald-500/40 blur-sm" />
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-emerald-500/60 via-green-500/50 to-emerald-600/60" />
          
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Should we expand into the European market this quarter?

Is hiring a dedicated CTO the right move for our stage?

Should we pivot our business model from B2C to B2B?"
            className={cn(
              "relative min-h-[160px] sm:min-h-[180px] text-base sm:text-lg resize-none leading-relaxed",
              "bg-background border-2 border-emerald-500/50 rounded-xl",
              "placeholder:text-muted-foreground/40 placeholder:leading-relaxed",
              "focus:border-emerald-400 focus:shadow-[0_0_20px_hsl(142,70%,45%,0.3)]",
              "transition-all duration-300",
              "shadow-[0_0_15px_hsl(142,70%,45%,0.15)]"
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
        
        {/* Risk Icons Row - Mobile optimized with larger touch targets */}
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RiskShieldIcon 
                size={40} 
                active={riskPreference <= 2}
                className="cursor-pointer"
              />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference <= 2 ? "text-primary" : "text-muted-foreground"
            )}>
              Safe
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RiskBalanceIcon 
                size={40} 
                active={riskPreference === 3}
                className="cursor-pointer"
              />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference === 3 ? "text-primary" : "text-muted-foreground"
            )}>
              Balanced
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <RiskRocketIcon 
                size={40} 
                active={riskPreference >= 4}
                className="cursor-pointer"
              />
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              riskPreference >= 4 ? "text-primary" : "text-muted-foreground"
            )}>
              Bold
            </span>
          </div>
        </div>

        {/* Slider with larger touch area */}
        <div className="py-2">
          <Slider
            value={[riskPreference]}
            onValueChange={([value]) => onRiskChange(value)}
            min={1}
            max={5}
            step={1}
            disabled={disabled}
            className="cursor-pointer touch-target"
          />
        </div>
      </div>
    </div>
  );
});

ValidationInput.displayName = 'ValidationInput';
