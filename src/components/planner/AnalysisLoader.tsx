import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Search, Sparkles, Zap } from "lucide-react";

export type StreamingStatus = 
  | 'idle'
  | 'research_start'
  | 'research_complete'
  | 'generation_start'
  | 'phase_complete'
  | 'complete'
  | 'error';

interface AnalysisLoaderProps {
  isDeepMode: boolean;
  streamingStatus?: StreamingStatus;
  sourceCount?: number;
  phasesCompleted?: number;
  totalPhases?: number;
}

export function AnalysisLoader({ 
  isDeepMode, 
  streamingStatus = 'idle',
  sourceCount = 0,
  phasesCompleted = 0,
  totalPhases = 4
}: AnalysisLoaderProps) {
  
  // Calculate progress based on streaming status
  const getProgress = () => {
    switch (streamingStatus) {
      case 'idle':
      case 'research_start':
        return 15;
      case 'research_complete':
        return 35;
      case 'generation_start':
        return 45;
      case 'phase_complete':
        return 50 + (phasesCompleted / totalPhases) * 45;
      case 'complete':
        return 100;
      default:
        return 10;
    }
  };

  const getStatusMessage = () => {
    switch (streamingStatus) {
      case 'idle':
      case 'research_start':
        return 'Researching market data...';
      case 'research_complete':
        return `Found ${sourceCount} sources`;
      case 'generation_start':
        return 'Creating strategy...';
      case 'phase_complete':
        return `Phase ${phasesCompleted} of ${totalPhases} complete`;
      case 'complete':
        return 'Strategy ready!';
      case 'error':
        return 'An error occurred';
      default:
        return 'Analyzing...';
    }
  };

  const steps = [
    { 
      id: 'research', 
      label: 'Market Research', 
      icon: Search,
      done: ['research_complete', 'generation_start', 'phase_complete', 'complete'].includes(streamingStatus),
      active: streamingStatus === 'research_start'
    },
    { 
      id: 'generate', 
      label: 'Strategy Generation', 
      icon: Sparkles,
      done: ['phase_complete', 'complete'].includes(streamingStatus) && phasesCompleted >= totalPhases,
      active: ['generation_start', 'phase_complete'].includes(streamingStatus)
    },
    { 
      id: 'finalize', 
      label: 'Finalizing', 
      icon: Zap,
      done: streamingStatus === 'complete',
      active: streamingStatus === 'phase_complete' && phasesCompleted >= totalPhases
    }
  ];

  return (
    <Card className={`border-primary/20 shadow-elegant overflow-hidden ${isDeepMode ? 'ring-1 ring-amber-500/20' : ''}`}>
      <div className={`h-1 ${isDeepMode ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30' : 'bg-primary/10'}`} />
      <CardContent className="py-8 px-6">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {isDeepMode ? "Deep Analysis" : "Creating Strategy"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>

          <div className="space-y-2">
            <Progress 
              value={getProgress()} 
              className={`h-2 transition-all duration-500 ${isDeepMode ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-500' : ''}`}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between gap-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 ${
                  step.done 
                    ? 'bg-primary/10' 
                    : step.active 
                      ? isDeepMode ? 'bg-amber-500/10 animate-pulse' : 'bg-primary/5 animate-pulse'
                      : 'bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  step.done 
                    ? 'bg-primary text-primary-foreground' 
                    : step.active 
                      ? isDeepMode ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <step.icon className={`h-4 w-4 ${step.active ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span className={`text-xs text-center font-medium ${
                  step.done || step.active ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Source count badge */}
          {sourceCount > 0 && (
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isDeepMode 
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' 
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                <Search className="h-3 w-3" />
                {sourceCount} market sources analyzed
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
