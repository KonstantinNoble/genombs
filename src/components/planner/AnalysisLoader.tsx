import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";

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
  const [animatedProgress, setAnimatedProgress] = useState(5);
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const lastStatusRef = useRef<StreamingStatus>('idle');
  
  // Get maximum progress allowed for current status (before next event)
  const getMaxProgressForStatus = (status: StreamingStatus) => {
    switch (status) {
      case 'idle':
        return 5;
      case 'research_start':
        return 35;
      case 'research_complete':
        return 50;
      case 'generation_start':
        return 60;
      case 'phase_complete':
        return 60 + (phasesCompleted / totalPhases) * 35; // Up to 95%
      case 'complete':
        return 100;
      default:
        return 5;
    }
  };

  // Get minimum progress for current status (jump to this on status change)
  const getMinProgressForStatus = (status: StreamingStatus) => {
    switch (status) {
      case 'idle':
        return 5;
      case 'research_start':
        return 15;
      case 'research_complete':
        return 40;
      case 'generation_start':
        return 50;
      case 'phase_complete':
        return 55 + ((phasesCompleted - 1) / totalPhases) * 35;
      case 'complete':
        return 100;
      default:
        return 5;
    }
  };

  // Reset on idle
  useEffect(() => {
    if (streamingStatus === 'idle') {
      setSimulatedProgress(0);
      setAnimatedProgress(5);
      lastStatusRef.current = 'idle';
    }
  }, [streamingStatus]);

  // Handle status changes - jump to minimum for new status
  useEffect(() => {
    if (streamingStatus !== lastStatusRef.current) {
      lastStatusRef.current = streamingStatus;
      
      // On complete, immediately jump to 100%
      if (streamingStatus === 'complete') {
        setAnimatedProgress(100);
        return;
      }
      
      // Jump to minimum progress for new status
      const minProgress = getMinProgressForStatus(streamingStatus);
      setAnimatedProgress(prev => Math.max(prev, minProgress));
    }
  }, [streamingStatus, phasesCompleted, totalPhases]);

  // Continuous simulated progress - always keeps moving
  useEffect(() => {
    if (streamingStatus === 'idle' || streamingStatus === 'complete') {
      return;
    }

    const interval = setInterval(() => {
      setSimulatedProgress(prev => prev + 1);
    }, 150); // Increment every 150ms

    return () => clearInterval(interval);
  }, [streamingStatus]);

  // Smooth animation combining simulated progress with status-based limits
  useEffect(() => {
    if (streamingStatus === 'idle' || streamingStatus === 'complete') {
      return;
    }

    const maxProgress = getMaxProgressForStatus(streamingStatus);
    const minProgress = getMinProgressForStatus(streamingStatus);
    
    // Calculate target: start from min, grow with simulation, cap at max
    const simulatedGrowth = simulatedProgress * 0.4; // 0.4% per tick
    const targetProgress = Math.min(minProgress + simulatedGrowth, maxProgress);

    // Smoothly animate towards target
    setAnimatedProgress(prev => {
      if (prev >= targetProgress) return prev;
      const diff = targetProgress - prev;
      // Fast catch-up if far behind, slow if close
      const speed = Math.max(0.5, diff * 0.1);
      return Math.min(prev + speed, targetProgress);
    });
  }, [simulatedProgress, streamingStatus, phasesCompleted, totalPhases]);

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
      label: 'Research', 
      step: 1,
      done: ['research_complete', 'generation_start', 'phase_complete', 'complete'].includes(streamingStatus),
      active: streamingStatus === 'research_start'
    },
    { 
      id: 'generate', 
      label: 'Generation', 
      step: 2,
      done: ['phase_complete', 'complete'].includes(streamingStatus) && phasesCompleted >= totalPhases,
      active: ['generation_start', 'phase_complete'].includes(streamingStatus)
    },
    { 
      id: 'finalize', 
      label: 'Finalize', 
      step: 3,
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
              value={animatedProgress} 
              className={`h-2 ${isDeepMode ? '[&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-yellow-500' : ''}`}
            />
          </div>

          {/* Step indicators - clean, minimal design */}
          <div className="flex justify-between gap-3">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-500 ${
                  step.done 
                    ? 'bg-primary/10' 
                    : step.active 
                      ? isDeepMode ? 'bg-amber-500/10' : 'bg-primary/5'
                      : 'bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 text-sm font-semibold ${
                  step.done 
                    ? 'bg-primary text-primary-foreground' 
                    : step.active 
                      ? isDeepMode ? 'bg-amber-500/20 text-amber-600' : 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.done ? '✓' : step.step}
                </div>
                <span className={`text-xs text-center font-medium transition-colors duration-300 ${
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
                {sourceCount} sources analyzed
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
