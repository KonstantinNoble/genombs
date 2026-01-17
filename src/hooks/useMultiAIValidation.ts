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

export interface ModelStates {
  gpt: 'queued' | 'running' | 'done' | 'failed';
  geminiPro: 'queued' | 'running' | 'done' | 'failed';
  geminiFlash: 'queued' | 'running' | 'done' | 'failed';
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
  const [modelStates, setModelStates] = useState<ModelStates>({
    gpt: 'queued',
    geminiPro: 'queued',
    geminiFlash: 'queued'
  });
  const [partialResponses, setPartialResponses] = useState<{
    gpt?: ModelResponse;
    geminiPro?: ModelResponse;
    geminiFlash?: ModelResponse;
  }>({});
  const [result, setResult] = useState<ValidationResult | null>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setModelStates({ gpt: 'queued', geminiPro: 'queued', geminiFlash: 'queued' });
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
    setModelStates({ gpt: 'running', geminiPro: 'running', geminiFlash: 'running' });

    // Create abort controller for overall timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 120000); // 120 second overall timeout (increased for GPT fallback)

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
              
              if (data.error && currentEvent === 'error') {
                throw new Error(data.error);
              }

              // Handle model_started events
              if (currentEvent === 'model_started') {
                const model = data.model as keyof ModelStates;
                if (model) {
                  setModelStates(prev => ({ ...prev, [model]: 'running' }));
                }
              }

              // Handle model_retry events (GPT fallback)
              if (currentEvent === 'model_retry') {
                console.log(`Model retry: ${data.model} - ${data.message}`);
              }

              // Handle model_complete events - update immediately
              if (currentEvent === 'model_complete' || (data.model && data.response)) {
                const model = data.model;
                const response = data.response;
                
                if (model === 'gpt' && response) {
                  gptResponse = response;
                  setPartialResponses(prev => ({ ...prev, gpt: response }));
                  setModelStates(prev => ({ ...prev, gpt: response.error ? 'failed' : 'done' }));
                  setStatus('gpt_complete');
                } else if (model === 'geminiPro' && response) {
                  geminiProResponse = response;
                  setPartialResponses(prev => ({ ...prev, geminiPro: response }));
                  setModelStates(prev => ({ ...prev, geminiPro: response.error ? 'failed' : 'done' }));
                  setStatus('gemini_pro_complete');
                } else if (model === 'geminiFlash' && response) {
                  geminiFlashResponse = response;
                  setPartialResponses(prev => ({ ...prev, geminiFlash: response }));
                  setModelStates(prev => ({ ...prev, geminiFlash: response.error ? 'failed' : 'done' }));
                  setStatus('gemini_flash_complete');
                }
              }

              // Handle complete event with all responses
              if (currentEvent === 'complete' || (data.gptResponse && data.geminiProResponse && data.geminiFlashResponse)) {
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

      // Count valid responses (at least 2 required to proceed)
      const validResponses = [gptResponse, geminiProResponse, geminiFlashResponse].filter(
        r => r && !r.error && r.recommendations.length > 0
      );

      if (validResponses.length < 2) {
        const errors = [];
        if (!gptResponse || gptResponse.error) errors.push(`GPT: ${gptResponse?.error || 'No response'}`);
        if (!geminiProResponse || geminiProResponse.error) errors.push(`Gemini Pro: ${geminiProResponse?.error || 'No response'}`);
        if (!geminiFlashResponse || geminiFlashResponse.error) errors.push(`Gemini Flash: ${geminiFlashResponse?.error || 'No response'}`);
        throw new Error(`Insufficient model responses. Errors: ${errors.join(', ')}`);
      }

      // Create stub responses for any missing models
      const createStubResponse = (modelId: string, modelName: string): ModelResponse => ({
        modelId,
        modelName,
        recommendations: [],
        summary: "",
        overallConfidence: 0,
        processingTimeMs: 0,
        error: "Model unavailable"
      });

      const finalGptResponse = gptResponse || createStubResponse('openai/gpt-5-mini', 'GPT-5 Mini');
      const finalGeminiProResponse = geminiProResponse || createStubResponse('google/gemini-3-pro-preview', 'Gemini 3 Pro');
      const finalGeminiFlashResponse = geminiFlashResponse || createStubResponse('google/gemini-3-flash-preview', 'Gemini 3 Flash');

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
            gptResponse: finalGptResponse,
            geminiProResponse: finalGeminiProResponse,
            geminiFlashResponse: finalGeminiFlashResponse,
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
        gptResponse: finalGptResponse,
        geminiProResponse: finalGeminiProResponse,
        geminiFlashResponse: finalGeminiFlashResponse,
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
    modelStates,
    partialResponses,
    result,
    resetState
  };
}
