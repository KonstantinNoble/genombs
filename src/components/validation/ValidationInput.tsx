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
      {/* Main Question Input */}
      <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-lg sm:rounded-xl bg-muted/30 border-2 border-primary/40">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="prompt" className="text-base sm:text-lg font-semibold text-foreground">
            Decision Context
          </Label>
          <span className={cn(
            "text-sm sm:text-base tabular-nums font-medium shrink-0",
            charactersRemaining <= 50 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {prompt.length}/{MAX_CHARACTERS}
          </span>
        </div>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder="E.g., Investment evaluation: Should we proceed with Series A funding for [Company]?"
          className="min-h-[120px] sm:min-h-[160px] text-base sm:text-lg resize-none leading-relaxed border-primary/10 focus:border-primary/30"
          disabled={disabled}
          maxLength={MAX_CHARACTERS}
        />
        <p className="text-sm sm:text-base text-muted-foreground">
          Describe the decision you need to document. Multiple perspectives will be recorded for your audit trail.
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
