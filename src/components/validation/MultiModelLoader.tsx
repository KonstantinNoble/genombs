import { cn } from "@/lib/utils";
import type { ValidationStatus, ModelStates } from "@/hooks/useMultiAIValidation";
import { AVAILABLE_MODELS } from "./ModelSelector";
import { useEffect, useState } from "react";

interface MultiModelLoaderProps {
  status: ValidationStatus;
  modelStates?: ModelStates;
  selectedModels?: string[];
}

interface ModelStatusProps {
  modelKey: string;
  name: string;
  state: 'queued' | 'running' | 'done' | 'failed';
  index: number;
}

function ModelStatus({ modelKey, name, state, index }: ModelStatusProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (state === 'running') {
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

  const model = AVAILABLE_MODELS[modelKey];
  const colorClass = model?.colorClass || '';

  return (
    <div 
      className={cn(
        "flex flex-col gap-2 sm:gap-3 p-3 sm:p-5 rounded-lg sm:rounded-xl border transition-all duration-300",
        state === 'done' 
          ? `${colorClass} border-current/30` 
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
          state === 'done' ? colorClass.split(' ')[0] : 
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
      {modelKey === 'perplexity' && state === 'running' && (
        <span className="text-xs sm:text-sm text-muted-foreground italic">
          Searching the web...
        </span>
      )}
      {modelKey === 'sonarReasoning' && state === 'running' && (
        <span className="text-xs sm:text-sm text-muted-foreground italic">
          Deep reasoning + web search...
        </span>
      )}
    </div>
  );
}

export function MultiModelLoader({ status, modelStates, selectedModels }: MultiModelLoaderProps) {
  const isEvaluating = status === 'evaluating';

  // Use selected models or default to legacy models
  const modelsToShow = selectedModels || ['gptMini', 'geminiPro', 'geminiFlash'];
  
  // Get states for each model
  const getModelState = (modelKey: string): 'queued' | 'running' | 'done' | 'failed' => {
    if (modelStates && modelStates[modelKey]) {
      return modelStates[modelKey];
    }
    // Default state based on status
    if (status === 'querying_models') return 'running';
    if (['evaluating', 'complete'].includes(status)) return 'done';
    return 'queued';
  };

  // Calculate overall progress
  const completedCount = modelsToShow.filter(key => {
    const state = getModelState(key);
    return state === 'done' || state === 'failed';
  }).length;
  
  let overallProgress = (completedCount / modelsToShow.length) * 75;
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
            : `Parallel analysis across ${modelsToShow.length} models`
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
        {modelsToShow.map((modelKey, index) => {
          const model = AVAILABLE_MODELS[modelKey];
          const name = model?.name || modelKey;
          const state = getModelState(modelKey);
          
          return (
            <ModelStatus 
              key={modelKey}
              modelKey={modelKey}
              name={name} 
              state={state} 
              index={index} 
            />
          );
        })}
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