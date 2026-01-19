import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  colorClass: string;
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  gptMini: { 
    id: 'gptMini', 
    name: 'GPT-5 Mini', 
    description: 'Reasoning',
    colorClass: 'text-blue-600 bg-blue-500/10 border-blue-500/20'
  },
  gpt52: { 
    id: 'gpt52', 
    name: 'GPT-5.2', 
    description: 'Deep Analysis',
    colorClass: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20'
  },
  geminiPro: { 
    id: 'geminiPro', 
    name: 'Gemini 3 Pro', 
    description: 'Creative',
    colorClass: 'text-purple-600 bg-purple-500/10 border-purple-500/20'
  },
  geminiFlash: { 
    id: 'geminiFlash', 
    name: 'Gemini Flash', 
    description: 'Pragmatic',
    colorClass: 'text-green-600 bg-green-500/10 border-green-500/20'
  },
  claude: { 
    id: 'claude', 
    name: 'Claude Sonnet 4', 
    description: 'Nuanced',
    colorClass: 'text-orange-600 bg-orange-500/10 border-orange-500/20'
  },
  perplexity: { 
    id: 'perplexity', 
    name: 'Perplexity Sonar', 
    description: 'Web Research',
    colorClass: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20'
  }
};

interface ModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
  modelWeights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModels,
  onModelsChange,
  modelWeights,
  onWeightsChange,
  disabled = false
}: ModelSelectorProps) {
  const modelIds = Object.keys(AVAILABLE_MODELS);
  
  const handleToggleModel = (modelId: string) => {
    if (disabled) return;
    
    const isSelected = selectedModels.includes(modelId);
    
    if (isSelected) {
      // Remove model
      const newSelected = selectedModels.filter(id => id !== modelId);
      onModelsChange(newSelected);
      
      // Redistribute weights among remaining models
      if (newSelected.length > 0) {
        const evenWeight = Math.floor(100 / newSelected.length);
        const remainder = 100 - (evenWeight * newSelected.length);
        const newWeights: Record<string, number> = {};
        newSelected.forEach((id, i) => {
          newWeights[id] = evenWeight + (i === 0 ? remainder : 0);
        });
        onWeightsChange(newWeights);
      } else {
        onWeightsChange({});
      }
    } else {
      // Add model (max 3)
      if (selectedModels.length >= 3) return;
      
      const newSelected = [...selectedModels, modelId];
      onModelsChange(newSelected);
      
      // Redistribute weights evenly
      const evenWeight = Math.floor(100 / newSelected.length);
      const remainder = 100 - (evenWeight * newSelected.length);
      const newWeights: Record<string, number> = {};
      newSelected.forEach((id, i) => {
        newWeights[id] = evenWeight + (i === 0 ? remainder : 0);
      });
      onWeightsChange(newWeights);
    }
  };

  const handleWeightChange = (modelId: string, newWeight: number) => {
    if (disabled) return;
    
    const otherModels = selectedModels.filter(id => id !== modelId);
    if (otherModels.length === 0) return;
    
    // Clamp weight
    const clampedWeight = Math.max(0, Math.min(100, newWeight));
    const remainingWeight = 100 - clampedWeight;
    
    // Distribute remaining weight proportionally among other models
    const currentOtherTotal = otherModels.reduce((sum, id) => sum + (modelWeights[id] || 0), 0);
    
    const newWeights: Record<string, number> = { [modelId]: clampedWeight };
    
    if (currentOtherTotal === 0) {
      // Distribute evenly if others are at 0
      const perModel = Math.floor(remainingWeight / otherModels.length);
      const remainder = remainingWeight - (perModel * otherModels.length);
      otherModels.forEach((id, i) => {
        newWeights[id] = perModel + (i === 0 ? remainder : 0);
      });
    } else {
      // Distribute proportionally
      let distributed = 0;
      otherModels.forEach((id, i) => {
        const proportion = (modelWeights[id] || 0) / currentOtherTotal;
        if (i === otherModels.length - 1) {
          newWeights[id] = remainingWeight - distributed;
        } else {
          const weight = Math.round(remainingWeight * proportion);
          newWeights[id] = weight;
          distributed += weight;
        }
      });
    }
    
    onWeightsChange(newWeights);
  };

  const handleDistributeEvenly = () => {
    if (disabled || selectedModels.length === 0) return;
    
    const evenWeight = Math.floor(100 / selectedModels.length);
    const remainder = 100 - (evenWeight * selectedModels.length);
    const newWeights: Record<string, number> = {};
    selectedModels.forEach((id, i) => {
      newWeights[id] = evenWeight + (i === 0 ? remainder : 0);
    });
    onWeightsChange(newWeights);
  };

  const weightSum = selectedModels.reduce((sum, id) => sum + (modelWeights[id] || 0), 0);
  const isValid = selectedModels.length === 3 && Math.abs(weightSum - 100) < 0.01;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label className="text-base sm:text-lg font-semibold">
          Select 3 Models <span className="text-muted-foreground font-normal">({selectedModels.length}/3)</span>
        </Label>
        {selectedModels.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDistributeEvenly}
            disabled={disabled}
            className="text-xs sm:text-sm"
          >
            Distribute Evenly
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:gap-3">
        {modelIds.map((modelId) => {
          const model = AVAILABLE_MODELS[modelId];
          const isSelected = selectedModels.includes(modelId);
          const canSelect = isSelected || selectedModels.length < 3;
          
          return (
            <div 
              key={modelId}
              className={cn(
                "p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all",
                isSelected 
                  ? `${model.colorClass} border-current/30` 
                  : "bg-muted/30 border-border",
                !canSelect && !isSelected && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Checkbox
                  id={modelId}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleModel(modelId)}
                  disabled={disabled || (!isSelected && selectedModels.length >= 3)}
                  className="h-5 w-5"
                />
                <div className="flex-1 min-w-0">
                  <label 
                    htmlFor={modelId}
                    className={cn(
                      "font-semibold text-sm sm:text-base cursor-pointer",
                      isSelected ? model.colorClass.split(' ')[0] : "text-foreground"
                    )}
                  >
                    {model.name}
                  </label>
                  <p className="text-xs sm:text-sm text-muted-foreground">{model.description}</p>
                </div>
                
                {isSelected && (
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-bold tabular-nums w-10 sm:w-12 text-right">
                      {modelWeights[modelId] || 0}%
                    </span>
                  </div>
                )}
              </div>
              
              {isSelected && (
                <div className="mt-3 sm:mt-4 pl-8 sm:pl-9">
                  <Slider
                    value={[modelWeights[modelId] || 0]}
                    onValueChange={([value]) => handleWeightChange(modelId, value)}
                    min={0}
                    max={100}
                    step={1}
                    disabled={disabled}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weight sum indicator */}
      <div className={cn(
        "flex items-center justify-between p-3 sm:p-4 rounded-lg border",
        isValid 
          ? "bg-primary/5 border-primary/20 text-primary"
          : selectedModels.length === 3 
            ? "bg-destructive/5 border-destructive/20 text-destructive"
            : "bg-muted/50 border-border text-muted-foreground"
      )}>
        <span className="text-sm sm:text-base font-medium">Total Weight</span>
        <span className="text-sm sm:text-base font-bold tabular-nums">
          {weightSum}% {!isValid && selectedModels.length === 3 && "(must be 100%)"}
          {selectedModels.length < 3 && `(select ${3 - selectedModels.length} more)`}
        </span>
      </div>
    </div>
  );
}
