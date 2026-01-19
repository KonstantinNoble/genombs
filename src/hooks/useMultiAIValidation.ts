import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ModelRecommendation {
  title: string;
  description: string;
  confidence: number;
  riskLevel: number;
  creativityLevel: number;
  reasoning: string;
  actionItems: string[];
  potentialRisks: string[];
  timeframe: string;
  model?: string;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  recommendations: ModelRecommendation[];
  summary: string;
  overallConfidence: number;
  processingTimeMs: number;
  error?: string;
  isFallback?: boolean;
  citations?: string[];
}

export interface ConsensusPoint {
  topic: string;
  description: string;
  confidence: number;
  actionItems: string[];
}

export interface MajorityPoint {
  topic: string;
  description: string;
  supportingModels: string[];
  confidence: number;
}

export interface DissentPoint {
  topic: string;
  positions: {
    modelName: string;
    position: string;
    reasoning: string;
  }[];
}

export interface StrategicAlternative {
  scenario: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface LongTermOutlook {
  sixMonths: string;
  twelveMonths: string;
  keyMilestones: string[];
}

export interface FinalRecommendation {
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  topActions: string[];
}

export interface ValidationResult {
  modelResponses: Record<string, ModelResponse>;
  selectedModels: string[];
  modelWeights: Record<string, number>;
  consensusPoints: ConsensusPoint[];
  majorityPoints: MajorityPoint[];
  dissentPoints: DissentPoint[];
  finalRecommendation: FinalRecommendation;
  overallConfidence: number;
  synthesisReasoning: string;
  processingTimeMs: number;
  validationId?: string;
  isPremium?: boolean;
  citations?: string[];
  // Premium-only fields
  strategicAlternatives?: StrategicAlternative[];
  longTermOutlook?: LongTermOutlook;
  competitorInsights?: string;
  // Legacy compatibility
  gptResponse?: ModelResponse;
  geminiProResponse?: ModelResponse;
  geminiFlashResponse?: ModelResponse;
}

export type ValidationStatus = 
  | 'idle'
  | 'querying_models'
  | 'evaluating'
  | 'complete'
  | 'error';

export type ModelState = 'queued' | 'running' | 'done' | 'failed';

export interface ModelStates {
  [modelKey: string]: ModelState;
}

export interface LimitReachedInfo {
  limitReached: true;
  isPremium: boolean;
  resetAt: Date;
}

interface UseMultiAIValidationOptions {
  onComplete?: (result: ValidationResult) => void;
  onError?: (error: string) => void;
  onLimitReached?: (info: LimitReachedInfo) => void;
}

export function useMultiAIValidation(options?: UseMultiAIValidationOptions) {
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [modelStates, setModelStates] = useState<ModelStates>({});
  const [partialResponses, setPartialResponses] = useState<Record<string, ModelResponse>>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setModelStates({});
    setPartialResponses({});
    setResult(null);
  }, []);

  const validate = useCallback(async (
    prompt: string,
    riskPreference: number = 3,
    selectedModels: string[],
    modelWeights: Record<string, number>
  ) => {
    setIsValidating(true);
    resetState();
    setStatus('querying_models');
    
    // Initialize model states
    const initialStates: ModelStates = {};
    selectedModels.forEach(key => {
      initialStates[key] = 'running';
    });
    setModelStates(initialStates);

    // Create abort controller for overall timeout (180s)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 180000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Step 1: Query all selected AI models in parallel
      const queryResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/multi-ai-query`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            prompt,
            riskPreference,
            selectedModels,
            modelWeights,
            streaming: true
          }),
          signal: abortController.signal
        }
      );

      if (!queryResponse.ok) {
        let errorData: any = {};
        try {
          const errorText = await queryResponse.text();
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`Query failed: ${queryResponse.status}`);
        }
        
        // Handle limit reached specially
        if (errorData.error === "LIMIT_REACHED") {
          console.log('Limit reached - showing dialog', errorData);
          const limitInfo: LimitReachedInfo = {
            limitReached: true,
            isPremium: errorData.isPremium ?? false,
            resetAt: new Date(errorData.resetAt)
          };
          setIsValidating(false);
          clearTimeout(timeoutId);
          options?.onLimitReached?.(limitInfo);
          return;
        }
        
        throw new Error(errorData.error || `Query failed: ${queryResponse.status}`);
      }

      // Parse SSE stream
      const reader = queryResponse.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let modelResponses: Record<string, ModelResponse> = {};
      let isPremiumUser = false;
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error && currentEvent === 'error') {
                throw new Error(data.error);
              }

              // Handle model_started events
              if (currentEvent === 'model_started') {
                const model = data.model as string;
                if (model) {
                  setModelStates(prev => ({ ...prev, [model]: 'running' }));
                }
              }

              // Handle model_complete events
              if (currentEvent === 'model_complete') {
                const model = data.model;
                const response = data.response;
                
                if (model && response) {
                  modelResponses[model] = response;
                  setPartialResponses(prev => ({ ...prev, [model]: response }));
                  setModelStates(prev => ({ 
                    ...prev, 
                    [model]: response.error ? 'failed' : 'done' 
                  }));
                }
              }

              // Handle complete event with all responses
              if (currentEvent === 'complete') {
                if (data.modelResponses) {
                  modelResponses = data.modelResponses;
                  setPartialResponses(data.modelResponses);
                }
                isPremiumUser = data.isPremium || false;
              }
              
              // Capture isPremium from any event
              if (data.isPremium !== undefined) {
                isPremiumUser = data.isPremium;
              }
              
              currentEvent = '';
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      // Count valid responses (at least 2 required)
      const validResponses = Object.values(modelResponses).filter(
        r => r && !r.error && r.recommendations && r.recommendations.length > 0
      );

      if (validResponses.length < 2) {
        const errors = Object.entries(modelResponses)
          .filter(([_, r]) => !r || r.error)
          .map(([key, r]) => `${key}: ${r?.error || 'No response'}`);
        throw new Error(`Insufficient model responses. Errors: ${errors.join(', ')}`);
      }

      // Step 2: Run meta-evaluation
      setStatus('evaluating');

      const evalResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-evaluation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            modelResponses,
            selectedModels,
            modelWeights,
            userPreferences: { riskPreference },
            prompt,
            saveToHistory: true,
            isPremium: isPremiumUser
          }),
        }
      );

      if (!evalResponse.ok) {
        const errorData = await evalResponse.json();
        throw new Error(errorData.error || 'Meta-evaluation failed');
      }

      const evalData = await evalResponse.json();

      const finalResult: ValidationResult = {
        modelResponses,
        selectedModels,
        modelWeights,
        consensusPoints: evalData.consensusPoints || [],
        majorityPoints: evalData.majorityPoints || [],
        dissentPoints: evalData.dissentPoints || [],
        finalRecommendation: evalData.finalRecommendation || {
          title: 'Analysis Complete',
          description: 'Review the consensus and dissent points below.',
          confidence: evalData.overallConfidence || 50,
          reasoning: evalData.synthesisReasoning || '',
          topActions: []
        },
        overallConfidence: evalData.overallConfidence || 50,
        synthesisReasoning: evalData.synthesisReasoning || '',
        processingTimeMs: evalData.processingTimeMs || 0,
        validationId: evalData.validationId || undefined,
        isPremium: isPremiumUser,
        citations: evalData.citations,
        // Premium-only fields
        strategicAlternatives: evalData.strategicAlternatives,
        longTermOutlook: evalData.longTermOutlook,
        competitorInsights: evalData.competitorInsights
      };

      setResult(finalResult);
      setStatus('complete');
      options?.onComplete?.(finalResult);

    } catch (error: any) {
      console.error('Multi-AI validation error:', error);
      setStatus('error');
      
      if (error.name === 'AbortError') {
        options?.onError?.('Request timed out. Please try again.');
      } else {
        options?.onError?.(error.message || 'Validation failed');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      setIsValidating(false);
    }
  }, [options, resetState]);

  return {
    validate,
    isValidating,
    status,
    modelStates,
    partialResponses,
    result,
    resetState
  };
}
