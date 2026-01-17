import { cn } from "@/lib/utils";
import type { ValidationStatus } from "@/hooks/useMultiAIValidation";

interface MultiModelLoaderProps {
  status: ValidationStatus;
}

interface ModelStatusProps {
  name: string;
  isComplete: boolean;
  isActive: boolean;
  colorClass: string;
}

function ModelStatus({ name, isComplete, isActive, colorClass }: ModelStatusProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl border transition-all duration-500",
      isComplete ? `${colorClass} scale-100` : isActive ? "border-primary/50 bg-primary/5 animate-pulse" : "border-muted bg-muted/20 opacity-50"
    )}>
      <div className="flex-1">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">
          {isComplete ? "Complete" : isActive ? "Analyzing..." : "Waiting..."}
        </p>
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

      <div className="grid gap-3 sm:grid-cols-3">
        <ModelStatus
          name="GPT-5.2"
          isComplete={gptComplete}
          isActive={isQueryingModels}
          colorClass="border-blue-500/30 bg-blue-500/10"
        />
        <ModelStatus
          name="Gemini 3 Pro"
          isComplete={geminiProComplete}
          isActive={isQueryingModels || gptComplete}
          colorClass="border-purple-500/30 bg-purple-500/10"
        />
        <ModelStatus
          name="Gemini Flash"
          isComplete={geminiFlashComplete}
          isActive={isQueryingModels || geminiProComplete}
          colorClass="border-green-500/30 bg-green-500/10"
        />
      </div>

      {isEvaluating && (
        <div className="flex items-center justify-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div>
            <p className="font-medium text-foreground">Meta-Evaluation</p>
            <p className="text-xs text-muted-foreground">Synthesizing recommendations...</p>
          </div>
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
