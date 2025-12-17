import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PlannerResult, StrategyPhase } from '@/components/planner/StrategyOutput';
import { StreamingStatus } from '@/components/planner/AnalysisLoader';

interface UseStreamingAnalysisOptions {
  onComplete?: (result: PlannerResult) => void;
  onError?: (error: string) => void;
}

interface StreamingState {
  status: StreamingStatus;
  sourceCount: number;
  phasesCompleted: number;
  totalPhases: number;
  partialResult: PlannerResult | null;
}

export function useStreamingAnalysis(options?: UseStreamingAnalysisOptions) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingState, setStreamingState] = useState<StreamingState>({
    status: 'idle',
    sourceCount: 0,
    phasesCompleted: 0,
    totalPhases: 4,
    partialResult: null
  });

  const resetState = useCallback(() => {
    setStreamingState({
      status: 'idle',
      sourceCount: 0,
      phasesCompleted: 0,
      totalPhases: 4,
      partialResult: null
    });
  }, []);

  const analyze = useCallback(async (body: Record<string, any>) => {
    setIsAnalyzing(true);
    resetState();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-tools-advisor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ ...body, streaming: true }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      const phases: StrategyPhase[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            continue;
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Handle different event types based on data structure
              if (data.message === 'Researching market data...') {
                setStreamingState(prev => ({ ...prev, status: 'research_start' }));
              } else if (data.sourceCount !== undefined) {
                setStreamingState(prev => ({ 
                  ...prev, 
                  status: 'research_complete',
                  sourceCount: data.sourceCount 
                }));
              } else if (data.message === 'Creating strategy...') {
                setStreamingState(prev => ({ ...prev, status: 'generation_start' }));
              } else if (data.phaseNumber !== undefined) {
                phases[data.phaseNumber - 1] = data.phase;
                setStreamingState(prev => ({
                  ...prev,
                  status: 'phase_complete',
                  phasesCompleted: data.phaseNumber,
                  totalPhases: data.totalPhases,
                  partialResult: { strategies: [...phases] }
                }));
              } else if (data.strategies) {
                // Final complete result
                setStreamingState(prev => ({
                  ...prev,
                  status: 'complete',
                  partialResult: data as PlannerResult
                }));
                options?.onComplete?.(data as PlannerResult);
              }
            } catch (e) {
              // Ignore JSON parse errors for incomplete data
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Streaming analysis error:', error);
      setStreamingState(prev => ({ ...prev, status: 'error' }));
      options?.onError?.(error.message || 'Analysis failed');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [options, resetState]);

  return {
    analyze,
    isAnalyzing,
    streamingState,
    resetState
  };
}
