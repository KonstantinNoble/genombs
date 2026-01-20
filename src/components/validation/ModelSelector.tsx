import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  colorClass: string;
  isPremium?: boolean;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  gptMini: { 
    id: 'gptMini', 
    name: 'GPT-5 Mini', 
    description: 'Fast Reasoning',
    colorClass: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    isPremium: false
  },
  geminiFlash: { 
    id: 'geminiFlash', 
    name: 'Gemini Flash', 
    description: 'Pragmatic',
    colorClass: 'text-green-600 bg-green-500/10 border-green-500/20',
    isPremium: false
  },
  claude: { 
    id: 'claude', 
    name: 'Claude Sonnet 4', 
    description: 'Nuanced',
    colorClass: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
    isPremium: false
  },
  perplexity: { 
    id: 'perplexity', 
    name: 'Perplexity Sonar', 
    description: 'Web Research',
    colorClass: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
    isPremium: false
  },
  // Premium-only models
  sonarReasoning: { 
    id: 'sonarReasoning', 
    name: 'Sonar Reasoning Pro', 
    description: 'Deep Reasoning + Search',
    colorClass: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
    isPremium: true
  },
  geminiPro: { 
    id: 'geminiPro', 
    name: 'Gemini 3 Pro', 
    description: 'Creative',
    colorClass: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
    isPremium: true
  }
};

interface ModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  modelWeights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
  disabled?: boolean;
  isPremium?: boolean;
}

export interface ModelSelectorRef {
  openAndScroll: () => void;
}

const MIN_WEIGHT = 10;
const MAX_WEIGHT = 80;

// Helper to distribute weights equally
function distributeWeightsEqually(models: string[]): Record<string, number> {
  if (models.length === 0) return {};
  const baseWeight = Math.floor(100 / models.length);
  const weights: Record<string, number> = {};
  models.forEach((model, index) => {
    // Last model gets remainder to ensure sum = 100
    weights[model] = index === models.length - 1 
      ? 100 - (baseWeight * (models.length - 1))
      : baseWeight;
  });
  return weights;
}

// Smart rebalance when one slider changes
function rebalanceWeights(
  models: string[],
  changedModel: string,
  newValue: number,
  currentWeights: Record<string, number>
): Record<string, number> {
  const otherModels = models.filter(m => m !== changedModel);
  if (otherModels.length === 0) return { [changedModel]: 100 };

  const remaining = 100 - newValue;
  const otherCurrentTotal = otherModels.reduce((sum, m) => sum + (currentWeights[m] || 0), 0);
  
  const newWeights: Record<string, number> = { [changedModel]: newValue };
  
  if (otherCurrentTotal === 0) {
    // Edge case: distribute equally
    const perModel = Math.floor(remaining / otherModels.length);
    otherModels.forEach((m, i) => {
      newWeights[m] = i === otherModels.length - 1 
        ? remaining - (perModel * (otherModels.length - 1))
        : perModel;
    });
  } else {
    // Proportional distribution
    let distributed = 0;
    otherModels.forEach((m, i) => {
      const proportion = (currentWeights[m] || 0) / otherCurrentTotal;
      let share = Math.round(remaining * proportion);
      
      // Enforce min/max
      share = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, share));
      
      if (i === otherModels.length - 1) {
        // Last one gets remainder
        share = remaining - distributed;
        share = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, share));
      }
      
      newWeights[m] = share;
      distributed += share;
    });
    
    // Correction pass if total != 100
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      const diff = 100 - total;
      // Adjust the model with most room
      const adjustable = models.find(m => {
        const w = newWeights[m];
        if (diff > 0) return w < MAX_WEIGHT;
        return w > MIN_WEIGHT;
      });
      if (adjustable) {
        newWeights[adjustable] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newWeights[adjustable] + diff));
      }
    }
  }
  
  return newWeights;
}

export const ModelSelector = forwardRef<ModelSelectorRef, ModelSelectorProps>(({
  selectedModels,
  onModelsChange,
  modelWeights,
  onWeightsChange,
  disabled = false,
  isPremium = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Expose method to open and scroll to the selector
  useImperativeHandle(ref, () => ({
    openAndScroll: () => {
      setIsOpen(true);
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }));
  
  // Order: Free models first, then premium models
  const freeModels = Object.keys(AVAILABLE_MODELS).filter(k => !AVAILABLE_MODELS[k].isPremium);
  const premiumModels = Object.keys(AVAILABLE_MODELS).filter(k => AVAILABLE_MODELS[k].isPremium);
  const orderedModelIds = [...freeModels, ...premiumModels];
  
  // Initialize/update weights when selection changes
  useEffect(() => {
    if (selectedModels.length === 3) {
      const currentKeys = Object.keys(modelWeights).sort();
      const selectedKeys = [...selectedModels].sort();
      
      // Only redistribute if models changed
      if (JSON.stringify(currentKeys) !== JSON.stringify(selectedKeys)) {
        onWeightsChange(distributeWeightsEqually(selectedModels));
      }
    }
  }, [selectedModels]);
  
  const handleToggleModel = (modelId: string) => {
    if (disabled) return;
    
    const model = AVAILABLE_MODELS[modelId];
    
    // Check if model is premium and user is not premium
    if (model.isPremium && !isPremium) {
      navigate('/pricing');
      return;
    }
    
    const isSelected = selectedModels.includes(modelId);
    
    if (isSelected) {
      const newSelected = selectedModels.filter(id => id !== modelId);
      onModelsChange(newSelected);
      // Redistribute weights for remaining models
      if (newSelected.length > 0) {
        onWeightsChange(distributeWeightsEqually(newSelected));
      } else {
        onWeightsChange({});
      }
    } else {
      if (selectedModels.length >= 3) return;
      
      const newSelected = [...selectedModels, modelId];
      onModelsChange(newSelected);
      // Redistribute weights for new selection
      onWeightsChange(distributeWeightsEqually(newSelected));
    }
  };

  const handleWeightChange = (modelId: string, newValue: number) => {
    if (disabled || selectedModels.length !== 3) return;
    
    // Clamp value
    newValue = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newValue));
    
    const newWeights = rebalanceWeights(selectedModels, modelId, newValue, modelWeights);
    onWeightsChange(newWeights);
  };

  // Get display names of selected models with weights
  const selectedModelDisplay = selectedModels
    .map(id => {
      const name = AVAILABLE_MODELS[id]?.name || id;
      const weight = modelWeights[id] || 0;
      return `${name.split(' ')[0]} ${weight}%`;
    })
    .join(' · ');

  const isValid = selectedModels.length === 3;
  const weightSum = Object.values(modelWeights).reduce((a, b) => a + b, 0);

  return (
    <div ref={containerRef} className="space-y-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "w-full flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all text-left",
              isOpen ? "bg-muted/50 border-primary/30" : "bg-muted/30 border-border hover:border-primary/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-base sm:text-lg font-semibold cursor-pointer">
                  AI Models
                </Label>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs sm:text-sm",
                    isValid ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground"
                  )}
                >
                  {selectedModels.length}/3
                </Badge>
              </div>
              {selectedModels.length > 0 && !isOpen && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  {selectedModelDisplay}
                </p>
              )}
            </div>
            <span className="text-muted-foreground text-lg font-medium shrink-0 ml-2">
              {isOpen ? "−" : "+"}
            </span>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-2">
          <div className="grid gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border bg-background">
            {orderedModelIds.map((modelId) => {
              const model = AVAILABLE_MODELS[modelId];
              const isSelected = selectedModels.includes(modelId);
              const canSelect = isSelected || selectedModels.length < 3;
              const isLocked = model.isPremium && !isPremium;
              const weight = modelWeights[modelId] || 0;
              
              return (
                <div 
                  key={modelId}
                  className={cn(
                    "flex flex-col gap-2 p-3 sm:p-4 rounded-lg transition-all",
                    isSelected 
                      ? `${model.colorClass} border border-current/30` 
                      : isLocked
                        ? "bg-muted/20 border border-border opacity-60"
                        : "bg-muted/30 border border-border hover:bg-muted/50",
                    !canSelect && !isSelected && !isLocked && "opacity-50"
                  )}
                >
                  <div 
                    onClick={() => handleToggleModel(modelId)}
                    className="flex items-center gap-3 sm:gap-4 cursor-pointer"
                  >
                    <Checkbox
                      id={modelId}
                      checked={isSelected}
                      disabled={disabled || isLocked || (!isSelected && selectedModels.length >= 3)}
                      className="h-5 w-5 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label 
                          className={cn(
                            "font-semibold text-sm sm:text-base cursor-pointer",
                            isSelected ? model.colorClass.split(' ')[0] : "text-foreground",
                            isLocked && "text-muted-foreground"
                          )}
                        >
                          {model.name}
                        </label>
                        {isLocked && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] sm:text-xs bg-amber-500/10 text-amber-600 border-amber-500/30"
                          >
                            Premium
                          </Badge>
                        )}
                        {isSelected && selectedModels.length === 3 && (
                          <Badge 
                            className="text-xs sm:text-sm font-bold tabular-nums bg-primary text-primary-foreground"
                          >
                            {weight}%
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs sm:text-sm",
                        isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                      )}>
                        {isLocked ? "Upgrade to Premium to use this model" : model.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Weight slider - only shown for selected models when 3 are selected */}
                  {isSelected && selectedModels.length === 3 && (
                    <div className="pl-9 pr-2 pt-2">
                      <Slider
                        value={[weight]}
                        onValueChange={([v]) => handleWeightChange(modelId, v)}
                        min={MIN_WEIGHT}
                        max={MAX_WEIGHT}
                        step={1}
                        disabled={disabled}
                        className="flex-1 cursor-pointer"
                      />
                      <p className={cn(
                        "text-sm sm:text-base font-medium mt-2 text-center",
                        weight < 25 ? 'text-muted-foreground' : weight > 45 ? 'text-primary' : 'text-foreground'
                      )}>
                        Influence: <span className="font-bold">{weight < 25 ? 'Low' : weight > 45 ? 'High' : 'Medium'}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Validation message */}
      {!isValid && (
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Select {3 - selectedModels.length} more model{selectedModels.length === 2 ? '' : 's'} to start validation
        </p>
      )}
      
      {/* Weight sum indicator (only show if invalid) */}
      {isValid && Math.abs(weightSum - 100) > 1 && (
        <p className="text-xs text-destructive text-center">
          Weights must sum to 100% (currently {weightSum}%)
        </p>
      )}
    </div>
  );
});

ModelSelector.displayName = 'ModelSelector';