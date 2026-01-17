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
  validationId?: string;
  isPremium?: boolean;
  // Premium-only fields
  strategicAlternatives?: StrategicAlternative[];
  longTermOutlook?: LongTermOutlook;
  competitorInsights?: string;
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

    // Create abort controller for overall timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 90000); // 90 second overall timeout

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
          signal: abortController.signal
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
          clearTimeout(timeoutId);
          options?.onLimitReached?.(limitInfo);
          return;
        }
        
        throw new Error(errorData.error || `Query failed: ${queryResponse.status}`);
      }

      // Parse SSE stream with proper event handling
      const reader = queryResponse.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let gptResponse: ModelResponse | undefined;
      let geminiProResponse: ModelResponse | undefined;
      let geminiFlashResponse: ModelResponse | undefined;
      let isPremiumUser = false;
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          // Track event type from "event:" lines
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Handle based on event type or data structure
              if (currentEvent === 'model_complete' || (data.model && data.response)) {
                const model = data.model;
                const response = data.response;
                
                if (model === 'gpt' && response) {
                  gptResponse = response;
                  setPartialResponses(prev => ({ ...prev, gpt: response }));
                  setStatus('gpt_complete');
                } else if (model === 'geminiPro' && response) {
                  geminiProResponse = response;
                  setPartialResponses(prev => ({ ...prev, geminiPro: response }));
                  setStatus('gemini_pro_complete');
                } else if (model === 'geminiFlash' && response) {
                  geminiFlashResponse = response;
                  setPartialResponses(prev => ({ ...prev, geminiFlash: response }));
                  setStatus('gemini_flash_complete');
                }
              } else if (currentEvent === 'complete' || (data.gptResponse && data.geminiProResponse && data.geminiFlashResponse)) {
                // Complete event with all responses
                gptResponse = data.gptResponse || gptResponse;
                geminiProResponse = data.geminiProResponse || geminiProResponse;
                geminiFlashResponse = data.geminiFlashResponse || geminiFlashResponse;
                isPremiumUser = data.isPremium || false;
                setPartialResponses({
                  gpt: gptResponse,
                  geminiPro: geminiProResponse,
                  geminiFlash: geminiFlashResponse
                });
              }
              
              // Capture isPremium from any event
              if (data.isPremium !== undefined) {
                isPremiumUser = data.isPremium;
              }
              
              // Reset event after processing
              currentEvent = '';
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      // Ensure we have all responses
      if (!gptResponse || !geminiProResponse || !geminiFlashResponse) {
        const missing = [];
        if (!gptResponse) missing.push('GPT-5.2');
        if (!geminiProResponse) missing.push('Gemini Pro');
        if (!geminiFlashResponse) missing.push('Gemini Flash');
        throw new Error(`Missing responses from: ${missing.join(', ')}`);
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
        processingTimeMs: evalData.processingTimeMs || 0,
        validationId: evalData.validationId || undefined,
        isPremium: isPremiumUser,
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
      
      // Handle abort/timeout specifically
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
    partialResponses,
    result,
    resetState
  };
}
