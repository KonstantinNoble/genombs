import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { ValidationStatus } from "@/hooks/useMultiAIValidation";
import { useEffect, useState } from "react";

interface MultiModelLoaderProps {
  status: ValidationStatus;
}

interface ModelStatusProps {
  name: string;
  isComplete: boolean;
  isActive: boolean;
  progress: number;
  index: number;
}

function ModelStatus({ name, isComplete, isActive, progress, index }: ModelStatusProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    if (isActive && !isComplete) {
      // Simulate gradual progress when active
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= 85) return prev;
          return prev + Math.random() * 8;
        });
      }, 400);
      return () => clearInterval(interval);
    } else if (isComplete) {
      setAnimatedProgress(100);
    }
  }, [isActive, isComplete]);

  const displayProgress = isComplete ? 100 : isActive ? animatedProgress : 0;

  return (
    <div 
      className={cn(
        "flex flex-col gap-3 p-5 rounded-xl border transition-all duration-300",
        isComplete 
          ? "border-primary/40 bg-primary/5" 
          : isActive 
            ? "border-primary/30 bg-background" 
            : "border-muted bg-muted/30"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-semibold text-base transition-colors",
          isComplete ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>
        <span className={cn(
          "text-sm font-medium tabular-nums",
          isComplete ? "text-primary" : "text-muted-foreground"
        )}>
          {isComplete ? "Done" : isActive ? `${Math.round(displayProgress)}%` : "Queued"}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            isComplete ? "bg-primary" : isActive ? "bg-primary/70 progress-striped" : "bg-muted-foreground/20"
          )}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
}

export function MultiModelLoader({ status }: MultiModelLoaderProps) {
  const isQueryingModels = status === 'querying_models';
  const gptComplete = ['gpt_complete', 'gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const geminiProComplete = ['gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const geminiFlashComplete = ['gemini_flash_complete', 'evaluating', 'complete'].includes(status);
  const isEvaluating = status === 'evaluating';

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    let target = 0;
    if (gptComplete) target += 25;
    else if (isQueryingModels) target += 12;
    
    if (geminiProComplete) target += 25;
    else if (isQueryingModels || gptComplete) target += 12;
    
    if (geminiFlashComplete) target += 25;
    else if (isQueryingModels || geminiProComplete) target += 12;
    
    if (isEvaluating) target += 20;
    if (status === 'complete') target = 100;

    // Smooth animation to target
    const step = () => {
      setOverallProgress(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.1;
      });
    };
    const interval = setInterval(step, 50);
    return () => clearInterval(interval);
  }, [status, gptComplete, geminiProComplete, geminiFlashComplete, isEvaluating, isQueryingModels]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">
          {isEvaluating ? "Synthesizing Results" : "Querying AI Models"}
        </h3>
        <p className="text-base text-muted-foreground">
          {isEvaluating 
            ? "Meta-analysis in progress — comparing perspectives"
            : "Parallel analysis across 3 independent models"
          }
        </p>
      </div>

      {/* Overall progress */}
      <div className="space-y-3 p-5 rounded-xl border bg-card">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-foreground">Overall Progress</span>
          <span className="text-lg font-bold text-primary tabular-nums">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Model cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ModelStatus
          name="GPT-5.2"
          isComplete={gptComplete}
          isActive={isQueryingModels}
          progress={0}
          index={0}
        />
        <ModelStatus
          name="Gemini 3 Pro"
          isComplete={geminiProComplete}
          isActive={isQueryingModels || gptComplete}
          progress={0}
          index={1}
        />
        <ModelStatus
          name="Gemini Flash"
          isComplete={geminiFlashComplete}
          isActive={isQueryingModels || geminiProComplete}
          progress={0}
          index={2}
        />
      </div>

      {/* Meta-evaluation indicator */}
      {isEvaluating && (
        <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">Meta-Evaluation</span>
            <span className="text-sm text-primary font-medium">Processing...</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary progress-striped" />
          </div>
        </div>
      )}

      {/* Time estimate */}
      <p className="text-center text-sm text-muted-foreground">
        Estimated time: 10-20 seconds
      </p>
    </div>
  );
}
