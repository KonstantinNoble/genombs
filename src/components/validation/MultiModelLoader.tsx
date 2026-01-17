import { cn } from "@/lib/utils";
import type { ValidationStatus, ModelStates } from "@/hooks/useMultiAIValidation";
import { useEffect, useState } from "react";

interface MultiModelLoaderProps {
  status: ValidationStatus;
  modelStates?: ModelStates;
}

interface ModelStatusProps {
  name: string;
  state: 'queued' | 'running' | 'done' | 'failed';
  index: number;
}

function ModelStatus({ name, state, index }: ModelStatusProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (state === 'running') {
      // Gradual progress while running
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 5;
        });
      }, 500);
      return () => clearInterval(interval);
    } else if (state === 'done' || state === 'failed') {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [state]);

  const getStatusText = () => {
    switch (state) {
      case 'queued': return 'Waiting';
      case 'running': return `${Math.round(progress)}%`;
      case 'done': return 'Done';
      case 'failed': return 'Failed';
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col gap-2 sm:gap-3 p-3 sm:p-5 rounded-lg sm:rounded-xl border transition-all duration-300",
        state === 'done' 
          ? "border-primary/40 bg-primary/5" 
          : state === 'failed'
            ? "border-destructive/40 bg-destructive/5"
            : state === 'running' 
              ? "border-primary/30 bg-background" 
              : "border-muted bg-muted/30"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          "font-semibold text-base sm:text-lg transition-colors",
          state === 'done' ? "text-primary" : 
          state === 'failed' ? "text-destructive" :
          state === 'running' ? "text-foreground" : "text-muted-foreground"
        )}>
          {name}
        </span>
        <span className={cn(
          "text-sm sm:text-base font-medium tabular-nums",
          state === 'done' ? "text-primary" : 
          state === 'failed' ? "text-destructive" :
          "text-muted-foreground"
        )}>
          {getStatusText()}
        </span>
      </div>
      <div className="h-2 sm:h-2.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            state === 'done' ? "bg-primary" : 
            state === 'failed' ? "bg-destructive" :
            state === 'running' ? "bg-primary/70 progress-striped" : "bg-muted-foreground/20"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function MultiModelLoader({ status, modelStates }: MultiModelLoaderProps) {
  const isEvaluating = status === 'evaluating';

  // Default states if not provided
  const states: ModelStates = modelStates || {
    gpt: status === 'querying_models' ? 'running' : 
         ['gpt_complete', 'gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status) ? 'done' : 'queued',
    geminiPro: status === 'querying_models' ? 'running' : 
               ['gemini_pro_complete', 'gemini_flash_complete', 'evaluating', 'complete'].includes(status) ? 'done' : 'queued',
    geminiFlash: status === 'querying_models' ? 'running' : 
                 ['gemini_flash_complete', 'evaluating', 'complete'].includes(status) ? 'done' : 'queued'
  };

  // Calculate overall progress based on actual model states
  const completedCount = [states.gpt, states.geminiPro, states.geminiFlash].filter(
    s => s === 'done' || s === 'failed'
  ).length;
  
  let overallProgress = (completedCount / 3) * 75; // Models take 75% of progress
  if (isEvaluating) overallProgress += 20;
  if (status === 'complete') overallProgress = 100;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
          {isEvaluating ? "Synthesizing Results" : "Querying AI Models"}
        </h3>
        <p className="text-sm sm:text-lg text-muted-foreground px-2">
          {isEvaluating 
            ? "Meta-analysis in progress"
            : "Parallel analysis across 3 models"
          }
        </p>
      </div>

      {/* Overall progress */}
      <div className="space-y-2 sm:space-y-3 p-3 sm:p-5 rounded-lg sm:rounded-xl border bg-card">
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-medium text-foreground">Overall Progress</span>
          <span className="text-lg sm:text-xl font-bold text-primary tabular-nums">
            {Math.round(overallProgress)}%
          </span>
        </div>
        <div className="h-2.5 sm:h-3.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Model cards - Stack on mobile */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <ModelStatus name="GPT-5 Mini" state={states.gpt} index={0} />
        <ModelStatus name="Gemini 3 Pro" state={states.geminiPro} index={1} />
        <ModelStatus name="Gemini Flash" state={states.geminiFlash} index={2} />
      </div>

      {/* Meta-evaluation indicator */}
      {isEvaluating && (
        <div className="p-3 sm:p-5 rounded-lg sm:rounded-xl border border-primary/30 bg-primary/5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-foreground">Meta-Evaluation</span>
            <span className="text-sm sm:text-base text-primary font-medium">Processing...</span>
          </div>
          <div className="h-2 sm:h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-primary progress-striped" />
          </div>
        </div>
      )}

      {/* Time estimate */}
      <p className="text-center text-sm sm:text-base text-muted-foreground">
        Typical: 30-60 seconds
      </p>
    </div>
  );
}
