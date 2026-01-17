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

export interface FinalRecommendation {
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  topActions: string[];
}

export interface ValidationResult {
  gptResponse: ModelResponse;
  geminiProResponse: ModelResponse;
  geminiFlashResponse: ModelResponse;
  consensusPoints: ConsensusPoint[];
  majorityPoints: MajorityPoint[];
  dissentPoints: DissentPoint[];
  finalRecommendation: FinalRecommendation;
  overallConfidence: number;
  synthesisReasoning: string;
  processingTimeMs: number;
}

export type ValidationStatus = 
  | 'idle'
  | 'querying_models'
  | 'gpt_complete'
  | 'gemini_pro_complete'
  | 'gemini_flash_complete'
  | 'evaluating'
  | 'complete'
  | 'error';

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
  const [partialResponses, setPartialResponses] = useState<{
    gpt?: ModelResponse;
    geminiPro?: ModelResponse;
    geminiFlash?: ModelResponse;
  }>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setPartialResponses({});
    setResult(null);
  }, []);

  const validate = useCallback(async (
    prompt: string,
    riskPreference: number = 3,
    creativityPreference: number = 3
  ) => {
    setIsValidating(true);
    resetState();
    setStatus('querying_models');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Step 1: Query all 3 AI models in parallel
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
            creativityPreference,
            streaming: true
          }),
        }
      );

      if (!queryResponse.ok) {
        const errorData = await queryResponse.json();
        
        // Handle limit reached specially - don't throw, call callback
        if (errorData.error === "LIMIT_REACHED") {
          const limitInfo: LimitReachedInfo = {
            limitReached: true,
            isPremium: errorData.isPremium,
            resetAt: new Date(errorData.resetAt)
          };
          setIsValidating(false);
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
      let gptResponse: ModelResponse | undefined;
      let geminiProResponse: ModelResponse | undefined;
      let geminiFlashResponse: ModelResponse | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              if (data.model === 'gpt' && data.response) {
                gptResponse = data.response;
                setPartialResponses(prev => ({ ...prev, gpt: data.response }));
                setStatus('gpt_complete');
              } else if (data.model === 'geminiPro' && data.response) {
                geminiProResponse = data.response;
                setPartialResponses(prev => ({ ...prev, geminiPro: data.response }));
                setStatus('gemini_pro_complete');
              } else if (data.model === 'geminiFlash' && data.response) {
                geminiFlashResponse = data.response;
                setPartialResponses(prev => ({ ...prev, geminiFlash: data.response }));
                setStatus('gemini_flash_complete');
              } else if (data.gptResponse && data.geminiProResponse && data.geminiFlashResponse) {
                // Complete response from non-streaming fallback
                gptResponse = data.gptResponse;
                geminiProResponse = data.geminiProResponse;
                geminiFlashResponse = data.geminiFlashResponse;
                setPartialResponses({
                  gpt: gptResponse,
                  geminiPro: geminiProResponse,
                  geminiFlash: geminiFlashResponse
                });
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      // Ensure we have all responses
      if (!gptResponse || !geminiProResponse || !geminiFlashResponse) {
        throw new Error('Not all model responses received');
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
            gptResponse,
            geminiProResponse,
            geminiFlashResponse,
            userPreferences: { riskPreference, creativityPreference },
            prompt,
            saveToHistory: true
          }),
        }
      );

      if (!evalResponse.ok) {
        const errorData = await evalResponse.json();
        throw new Error(errorData.error || 'Meta-evaluation failed');
      }

      const evalData = await evalResponse.json();

      const finalResult: ValidationResult = {
        gptResponse,
        geminiProResponse,
        geminiFlashResponse,
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
        processingTimeMs: evalData.processingTimeMs || 0
      };

      setResult(finalResult);
      setStatus('complete');
      options?.onComplete?.(finalResult);

    } catch (error: any) {
      console.error('Multi-AI validation error:', error);
      setStatus('error');
      options?.onError?.(error.message || 'Validation failed');
      throw error;
    } finally {
      setIsValidating(false);
    }
  }, [options, resetState]);

  return {
    validate,
    isValidating,
    status,
    partialResponses,
    result,
    resetState
  };
}
