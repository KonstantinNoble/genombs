import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ValidationStatus } from "@/hooks/useMultiAIValidation";

interface MultiModelLoaderProps {
  status: ValidationStatus;
}

interface ModelStatusProps {
  name: string;
  isComplete: boolean;
  isActive: boolean;
  progress: number;
}

function ModelStatus({ name, isComplete, isActive, progress }: ModelStatusProps) {
  return (
    <div className={cn(
      "flex flex-col gap-2 p-4 rounded-xl border transition-all duration-500",
      isComplete 
        ? "border-primary/30 bg-primary/5" 
        : isActive 
          ? "border-primary/50 bg-primary/5" 
          : "border-muted bg-muted/20 opacity-50"
    )}>
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {isComplete ? "Complete" : isActive ? "Analyzing..." : "Waiting..."}
        </p>
      </div>
      <Progress 
        value={progress} 
        className={cn(
          "h-2 transition-all duration-300",
          isComplete ? "[&>div]:bg-primary" : isActive ? "[&>div]:bg-primary/70" : "[&>div]:bg-muted"
        )}
      />
    </div>
  );
}

export function MultiModelLoader({ status }: MultiModelLoaderProps) {
  const isQueryingModels = status === 'querying_models';
  const gptComplete = ['gpt_complete', 'gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const geminiProComplete = ['gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const geminiFlashComplete = ['gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const isEvaluating = status === 'evaluating';

  // Calculate progress for each model
  const getProgress = (isComplete: boolean, isActive: boolean) => {
    if (isComplete) return 100;
    if (isActive) return 65; // Shows progress is happening
    return 0;
  };

  // Calculate overall progress
  const overallProgress = (() => {
    let progress = 0;
    if (gptComplete) progress += 25;
    else if (isQueryingModels) progress += 12;
    
    if (geminiProComplete) progress += 25;
    else if (isQueryingModels || gptComplete) progress += 12;
    
    if (geminiFlashComplete) progress += 25;
    else if (isQueryingModels || geminiProComplete) progress += 12;
    
    if (isEvaluating) progress += 15;
    if (status === 'complete') progress = 100;
    
    return progress;
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {isEvaluating ? "Analyzing Consensus..." : "Querying AI Models..."}
        </h3>
        <p className="text-muted-foreground">
          {isEvaluating 
            ? "Meta-evaluation in progress. Identifying agreements and disagreements..."
            : "Getting perspectives from 3 different AI models in parallel"
          }
        </p>
      </div>

      {/* Overall progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
        </div>
        <Progress 
          value={overallProgress} 
          className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-primary/70 [&>div]:transition-all [&>div]:duration-500"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ModelStatus
          name="GPT-5.2"
          isComplete={gptComplete}
          isActive={isQueryingModels}
          progress={getProgress(gptComplete, isQueryingModels)}
        />
        <ModelStatus
          name="Gemini 3 Pro"
          isComplete={geminiProComplete}
          isActive={isQueryingModels || gptComplete}
          progress={getProgress(geminiProComplete, isQueryingModels || gptComplete)}
        />
        <ModelStatus
          name="Gemini Flash"
          isComplete={geminiFlashComplete}
          isActive={isQueryingModels || geminiProComplete}
          progress={getProgress(geminiFlashComplete, isQueryingModels || geminiProComplete)}
        />
      </div>

      {isEvaluating && (
        <div className="space-y-2 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-foreground">Meta-Evaluation</p>
            <p className="text-xs text-muted-foreground">Synthesizing...</p>
          </div>
          <Progress 
            value={75} 
            className="h-2 [&>div]:bg-primary"
          />
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>This usually takes 10-20 seconds</span>
        </div>
      </div>
    </div>
  );
}
