import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  disabled?: boolean;
  isPremium?: boolean;
}

export function ModelSelector({
  selectedModels,
  onModelsChange,
  disabled = false,
  isPremium = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Order: Free models first, then premium models
  const freeModels = Object.keys(AVAILABLE_MODELS).filter(k => !AVAILABLE_MODELS[k].isPremium);
  const premiumModels = Object.keys(AVAILABLE_MODELS).filter(k => AVAILABLE_MODELS[k].isPremium);
  const orderedModelIds = [...freeModels, ...premiumModels];
  
  const handleToggleModel = (modelId: string) => {
    if (disabled) return;
    
    const model = AVAILABLE_MODELS[modelId];
    
    // Check if model is premium and user is not premium
    if (model.isPremium && !isPremium) {
      // Navigate to pricing
      navigate('/pricing');
      return;
    }
    
    const isSelected = selectedModels.includes(modelId);
    
    if (isSelected) {
      // Remove model
      const newSelected = selectedModels.filter(id => id !== modelId);
      onModelsChange(newSelected);
    } else {
      // Add model (max 3)
      if (selectedModels.length >= 3) return;
      
      const newSelected = [...selectedModels, modelId];
      onModelsChange(newSelected);
    }
  };

  // Get display names of selected models
  const selectedModelNames = selectedModels
    .map(id => AVAILABLE_MODELS[id]?.name || id)
    .join(', ');

  const isValid = selectedModels.length === 3;

  return (
    <div className="space-y-2">
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
                  {selectedModelNames}
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
              
              return (
                <div 
                  key={modelId}
                  onClick={() => handleToggleModel(modelId)}
                  className={cn(
                    "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all cursor-pointer",
                    isSelected 
                      ? `${model.colorClass} border border-current/30` 
                      : isLocked
                        ? "bg-muted/20 border border-border opacity-60"
                        : "bg-muted/30 border border-border hover:bg-muted/50",
                    !canSelect && !isSelected && !isLocked && "opacity-50 cursor-not-allowed"
                  )}
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
                    </div>
                    <p className={cn(
                      "text-xs sm:text-sm",
                      isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}>
                      {isLocked ? "Upgrade to Premium to use this model" : model.description}
                    </p>
                  </div>
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
    </div>
  );
}