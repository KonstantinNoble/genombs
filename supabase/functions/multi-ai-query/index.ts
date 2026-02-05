import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model ID mapping: Internal ID -> Direct API ID
const MODEL_ID_MAPPING: Record<string, string> = {
  // OpenAI models via direct API
  'openai/gpt-5-mini': 'gpt-4o-mini',
  'openai/gpt-5': 'gpt-4o',
  'openai/gpt-5-nano': 'gpt-4o-mini',
  'openai/gpt-5.2': 'gpt-4o',
  // Google models via direct API (STABLE versions - January 2026)
  'google/gemini-3-pro-preview': 'gemini-2.5-pro',
  'google/gemini-2.5-flash': 'gemini-2.5-flash',
  'google/gemini-2.5-pro': 'gemini-2.5-pro',
  'google/gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
  'google/gemini-3-flash-preview': 'gemini-2.5-flash',
};

// Gemini model fallback candidates - if first fails with 404, try next
// CORRECTED: Only use actually existing model IDs (January 2026)
// gemini-2.0-pro and gemini-1.5-pro/flash do NOT exist and cause 404!
const GEMINI_MODEL_CANDIDATES: Record<string, string[]> = {
  'geminiPro': ['gemini-2.5-pro', 'gemini-3-pro-preview', 'gemini-2.0-flash'],
  'geminiFlash': ['gemini-2.5-flash', 'gemini-3-flash-preview', 'gemini-2.0-flash'],
};

// JSON Response Schema for Gemini's structured output mode
// OPTIMIZED: Added maxLength constraints to prevent truncation
const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", maxLength: 120 },
          description: { type: "string", maxLength: 300 },
          confidence: { type: "number" },
          riskLevel: { type: "number" },
          creativityLevel: { type: "number" },
          reasoning: { type: "string", maxLength: 250 },
          actionItems: { type: "array", items: { type: "string", maxLength: 150 } },
          potentialRisks: { type: "array", items: { type: "string", maxLength: 120 } },
          timeframe: { type: "string", maxLength: 80 },
          competitiveAdvantage: { type: "string", maxLength: 200 },
          longTermImplications: { type: "string", maxLength: 250 },
          resourceRequirements: { type: "string", maxLength: 250 }
        },
        required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
      }
    },
    summary: { type: "string", maxLength: 500 },
    overallConfidence: { type: "number" },
    marketContext: { type: "string", maxLength: 400 },
    strategicOutlook: { type: "string", maxLength: 400 }
  },
  required: ["recommendations", "summary", "overallConfidence"]
};

// Helper: Repair truncated JSON by closing unclosed braces/brackets
function repairTruncatedJSON(jsonStr: string): string {
  let repaired = jsonStr.trim();
  
  // Count opening and closing brackets/braces
  const openBraces = (repaired.match(/{/g) || []).length;
  const closeBraces = (repaired.match(/}/g) || []).length;
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/]/g) || []).length;
  
  // If balanced, return as-is
  if (openBraces === closeBraces && openBrackets === closeBrackets) {
    return repaired;
  }
  
  console.log(`[JSON Repair] Unbalanced: { ${openBraces}/${closeBraces} } [ ${openBrackets}/${closeBrackets} ]`);
  
  // Add missing closing brackets first (innermost)
  const missingBrackets = Math.max(0, openBrackets - closeBrackets);
  repaired += ']'.repeat(missingBrackets);
  
  // Then add missing closing braces
  const missingBraces = Math.max(0, openBraces - closeBraces);
  repaired += '}'.repeat(missingBraces);
  
  console.log(`[JSON Repair] Added ${missingBrackets} ] and ${missingBraces} }`);
  
  return repaired;
}

// All available model configurations
const ALL_MODELS: Record<string, { id: string; name: string; gateway: 'openai' | 'google' | 'anthropic' | 'perplexity'; characteristics: { reasoning: string; tendency: string; strengths: string[] } }> = {
  gptMini: {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    gateway: 'openai',
    characteristics: {
      reasoning: 'good',
      tendency: 'balanced',
      strengths: ['Speed', 'Efficiency', 'Reliability']
    }
  },
  sonarReasoning: {
    id: 'sonar-reasoning-pro',
    name: 'Sonar Reasoning Pro',
    gateway: 'perplexity',
    characteristics: {
      reasoning: 'excellent',
      tendency: 'analytical',
      strengths: ['Chain-of-thought', 'Real-time search', 'Deep reasoning', 'Citations']
    }
  },
  geminiPro: {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    gateway: 'google',
    characteristics: {
      reasoning: 'strong',
      tendency: 'creative',
      strengths: ['Big context', 'Multimodal', 'Comprehensive']
    }
  },
  geminiFlash: {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini Flash',
    gateway: 'google',
    characteristics: {
      reasoning: 'good',
      tendency: 'pragmatic',
      strengths: ['Speed', 'Efficiency', 'Practical solutions']
    }
  },
  claude: {
    id: 'claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    gateway: 'anthropic',
    characteristics: {
      reasoning: 'excellent',
      tendency: 'nuanced',
      strengths: ['Advanced reasoning', 'Nuanced analysis', 'Ethical considerations', 'Balanced views']
    }
  },
  perplexity: {
    id: 'sonar-pro',
    name: 'Perplexity Sonar',
    gateway: 'perplexity',
    characteristics: {
      reasoning: 'good',
      tendency: 'research-focused',
      strengths: ['Real-time web search', 'Current data', 'Source citations']
    }
  }
};

// Structured output schema for tool calling
const getRecommendationTool = (isPremium: boolean) => ({
  type: "function",
  function: {
    name: "provide_recommendations",
    description: "Provide structured business recommendations based on the query",
    parameters: {
      type: "object",
      properties: {
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Short, actionable recommendation title" },
              description: { type: "string", description: isPremium ? "Detailed explanation (4-5 sentences with comprehensive reasoning)" : "Detailed explanation (2-3 sentences)" },
              confidence: { type: "number", description: "Confidence level 0-100" },
              riskLevel: { type: "number", description: "Risk level 1-5 (1=conservative, 5=aggressive)" },
              creativityLevel: { type: "number", description: "Creativity level 1-5 (1=factual, 5=innovative)" },
              reasoning: { type: "string", description: isPremium ? "Comprehensive reasoning with market context and competitive considerations" : "Why this recommendation makes sense" },
              actionItems: {
                type: "array",
                items: { type: "string" },
                description: isPremium ? "5-7 concrete, detailed next steps with specific metrics where applicable" : "3-5 concrete next steps"
              },
              potentialRisks: {
                type: "array",
                items: { type: "string" },
                description: isPremium ? "3-5 potential risks with mitigation strategies" : "2-3 potential risks to consider"
              },
              timeframe: { type: "string", description: "Expected implementation timeframe" },
              ...(isPremium && {
                competitiveAdvantage: { type: "string", description: "How this creates competitive advantage in the market" },
                longTermImplications: { type: "string", description: "Long-term strategic implications (12+ months)" },
                resourceRequirements: { type: "string", description: "Key resources needed (budget, team, tools)" }
              })
            },
            required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
          }
        },
        summary: { type: "string", description: isPremium ? "Comprehensive summary of recommendations with strategic context (4-5 sentences)" : "Overall summary of recommendations (2-3 sentences)" },
        overallConfidence: { type: "number", description: "Overall confidence in these recommendations 0-100" },
        ...(isPremium && {
          marketContext: { type: "string", description: "Brief market context and competitive landscape relevant to these recommendations" },
          strategicOutlook: { type: "string", description: "12-month strategic outlook based on these recommendations" }
        })
      },
      required: ["recommendations", "summary", "overallConfidence"]
    }
  }
});

// Claude-specific tool schema (uses input_schema instead of parameters)
const getClaudeRecommendationTool = (isPremium: boolean) => ({
  name: "provide_recommendations",
  description: "Provide structured business recommendations based on the query",
  input_schema: {
    type: "object",
    properties: {
      recommendations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Short, actionable recommendation title" },
            description: { type: "string", description: isPremium ? "Detailed explanation (4-5 sentences)" : "Detailed explanation (2-3 sentences)" },
            confidence: { type: "number", description: "Confidence level 0-100" },
            riskLevel: { type: "number", description: "Risk level 1-5" },
            creativityLevel: { type: "number", description: "Creativity level 1-5" },
            reasoning: { type: "string", description: "Why this recommendation makes sense" },
            actionItems: { type: "array", items: { type: "string" } },
            potentialRisks: { type: "array", items: { type: "string" } },
            timeframe: { type: "string", description: "Expected implementation timeframe" }
          },
          required: ["title", "description", "confidence", "riskLevel", "creativityLevel", "reasoning", "actionItems", "potentialRisks", "timeframe"]
        }
      },
      summary: { type: "string", description: "Overall summary of recommendations" },
      overallConfidence: { type: "number", description: "Overall confidence 0-100" }
    },
    required: ["recommendations", "summary", "overallConfidence"]
  }
});

interface ModelResponse {
  modelId: string;
  modelName: string;
  recommendations: {
    title: string;
    description: string;
    confidence: number;
    riskLevel: number;
    creativityLevel: number;
    reasoning: string;
    actionItems: string[];
    potentialRisks: string[];
    timeframe: string;
    competitiveAdvantage?: string;
    longTermImplications?: string;
    resourceRequirements?: string;
  }[];
  summary: string;
  overallConfidence: number;
  processingTimeMs: number;
  marketContext?: string;
  strategicOutlook?: string;
  error?: string;
  isFallback?: boolean;
  citations?: string[];
}

// Query OpenAI models directly
async function queryOpenAIModel(
  modelKey: string,
  modelConfig: typeof ALL_MODELS.gptMini,
  prompt: string,
  apiKey: string,
  isPremium: boolean,
  timeoutMs: number = 60000
): Promise<ModelResponse> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Map internal model ID to OpenAI API model ID
  const directModelId = MODEL_ID_MAPPING[modelConfig.id] || 'gpt-4o-mini';
  
  console.log(`[${modelConfig.name}] Starting query via OpenAI API (model: ${directModelId})...`);
  
  try {
    const recommendationCount = isPremium ? "4-5" : "2-3";
    const detailLevel = isPremium 
      ? "Provide comprehensive, detailed analysis with market context, competitive considerations, and long-term strategic implications."
      : "Provide clear, actionable analysis.";
    
    const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

## MANDATORY: BUSINESS CONTEXT HANDLING
The user's query will contain a "BUSINESS CONTEXT" section at the VERY BEGINNING with critical information:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- **Company Website URL and Website Analysis** (if available)

### CRITICAL REQUIREMENT FOR WEBSITE CONTENT:
If the business context includes "Website Analysis" or "Company Website", you MUST:
1. Reference specific information from the website analysis in your recommendations
2. Align your strategies with what the company actually does (based on their website)
3. Mention the website content explicitly in at least 2 of your recommendations
4. Use the website insights to make your advice MORE SPECIFIC and TAILORED

### GENERAL TAILORING RULES:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If NO business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
${detailLevel}
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.${isPremium ? `

PREMIUM ANALYSIS REQUIREMENTS:
- Include competitive advantage analysis for each recommendation
- Provide long-term implications (12+ month outlook)
- Add resource requirements (budget estimates, team needs, tools)
- Include market context in your summary
- Provide a 12-month strategic outlook` : ''}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: directModelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        tools: [getRecommendationTool(isPremium)],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${modelConfig.name}] Error ${response.status}:`, errorText);
      
      if (response.status === 429) throw new Error("Rate limit exceeded");
      if (response.status === 402) throw new Error("Payment required");
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      console.error(`[${modelConfig.name}] No tool call in response`);
      throw new Error("No structured response from model");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const processingTime = Date.now() - startTime;
    
    console.log(`[${modelConfig.name}] Completed in ${processingTime}ms with ${parsed.recommendations?.length || 0} recommendations`);
    
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || "",
      overallConfidence: parsed.overallConfidence || 50,
      processingTimeMs: processingTime,
      ...(isPremium && {
        marketContext: parsed.marketContext,
        strategicOutlook: parsed.strategicOutlook
      })
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`[${modelConfig.name}] Timed out after ${processingTime}ms`);
      return {
        modelId: modelConfig.id,
        modelName: modelConfig.name,
        recommendations: [],
        summary: "",
        overallConfidence: 0,
        processingTimeMs: processingTime,
        error: "Request timed out"
      };
    }
    
    console.error(`[${modelConfig.name}] Failed after ${processingTime}ms:`, error.message);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: [],
      summary: "",
      overallConfidence: 0,
      processingTimeMs: processingTime,
      error: error.message
    };
  }
}

// Query Google Gemini models directly with fallback candidates
async function queryGoogleModel(
  modelKey: string,
  modelConfig: typeof ALL_MODELS.geminiPro,
  prompt: string,
  apiKey: string,
  isPremium: boolean,
  timeoutMs: number = 60000
): Promise<ModelResponse> {
  const startTime = Date.now();
  
  // Get fallback candidates for this model type
  const candidates = GEMINI_MODEL_CANDIDATES[modelKey] || [MODEL_ID_MAPPING[modelConfig.id] || 'gemini-2.0-flash'];
  const triedModels: string[] = [];
  let lastError: string = '';
  
  console.log(`[${modelConfig.name}] Starting query with candidates: ${candidates.join(', ')}`);
  
  const recommendationCount = isPremium ? "4-5" : "2-3";
  const detailLevel = isPremium 
    ? "Provide comprehensive, detailed analysis with market context, competitive considerations, and long-term strategic implications."
    : "Provide clear, actionable analysis.";
  
  // System instruction with explicit JSON format request (no responseMimeType)
  const systemInstruction = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If no business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
${detailLevel}
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.${isPremium ? `

PREMIUM ANALYSIS REQUIREMENTS:
- Include competitive advantage analysis for each recommendation
- Provide long-term implications (12+ month outlook)
- Add resource requirements (budget estimates, team needs, tools)
- Include market context in your summary
- Provide a 12-month strategic outlook` : ''}

CRITICAL: You MUST respond with ONLY a valid JSON object (no markdown, no explanation, just pure JSON) in this exact format:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "confidence": number (0-100),
      "riskLevel": number (1-5),
      "creativityLevel": number (1-5),
      "reasoning": "string",
      "actionItems": ["string", "string", ...],
      "potentialRisks": ["string", "string", ...],
      "timeframe": "string"
    }
  ],
  "summary": "string",
  "overallConfidence": number (0-100)
}`;

  // Try each candidate model
  for (const candidateId of candidates) {
    triedModels.push(candidateId);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    console.log(`[${modelConfig.name}] Trying model: ${candidateId}...`);
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${candidateId}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey  // Header-based auth (more reliable)
          },
          body: JSON.stringify({
            contents: [
              { 
                role: "user", 
                parts: [{ text: `${systemInstruction}\n\nUser Query: ${prompt}` }] 
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              // Use structured JSON output with schema (per Google docs)
              responseMimeType: "application/json",
              responseSchema: GEMINI_RESPONSE_SCHEMA
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${modelConfig.name}] Model ${candidateId} error ${response.status}:`, errorText);
        
        // Try to extract Google's error message
        let googleErrorMsg = '';
        try {
          const errorJson = JSON.parse(errorText);
          googleErrorMsg = errorJson.error?.message || '';
        } catch {}
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded");
        }
        
        // 404 = model not found, try next candidate
        if (response.status === 404) {
          lastError = `Model ${candidateId} not found${googleErrorMsg ? `: ${googleErrorMsg}` : ''}`;
          console.log(`[${modelConfig.name}] 404 for ${candidateId}, trying next candidate...`);
          continue;
        }
        
        // Other errors: save message and try next
        lastError = googleErrorMsg || `API error: ${response.status}`;
        continue;
      }

      const data = await response.json();
      
      // Google AI returns content in a different format
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        console.error(`[${modelConfig.name}] No content in response from ${candidateId}`);
        lastError = "No response content from model";
        continue;
      }

      // Robust JSON parsing with truncation repair fallback
      let parsed;
      try {
        // Try multiple extraction patterns
        let jsonStr = content.trim();
        
        // Pattern 1: ```json ... ```
        const jsonCodeBlock = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlock) {
          jsonStr = jsonCodeBlock[1].trim();
        } else {
          // Pattern 2: ``` ... ```
          const codeBlock = content.match(/```\s*([\s\S]*?)\s*```/);
          if (codeBlock) {
            jsonStr = codeBlock[1].trim();
          }
        }
        
        // Pattern 3: Find JSON object boundaries
        if (!jsonStr.startsWith('{')) {
          const jsonStart = jsonStr.indexOf('{');
          const jsonEnd = jsonStr.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
          }
        }
        
        // First attempt: Direct parse
        try {
          parsed = JSON.parse(jsonStr);
        } catch (directParseError) {
          // Second attempt: Repair truncated JSON and retry
          console.log(`[${modelConfig.name}] Direct parse failed for ${candidateId}, attempting truncation repair...`);
          const repairedJson = repairTruncatedJSON(jsonStr);
          parsed = JSON.parse(repairedJson);
          console.log(`[${modelConfig.name}] Truncation repair SUCCEEDED for ${candidateId}`);
        }
      } catch (parseError) {
        console.error(`[${modelConfig.name}] Failed to parse JSON from ${candidateId} (even after repair):`, parseError);
        console.log(`[${modelConfig.name}] Raw content (first 500 chars):`, content.substring(0, 500));
        lastError = "Invalid JSON response from model";
        continue;
      }

      const processingTime = Date.now() - startTime;
      
      console.log(`[${modelConfig.name}] SUCCESS with ${candidateId} in ${processingTime}ms (${parsed.recommendations?.length || 0} recommendations)`);
      
      return {
        modelId: modelConfig.id,
        modelName: `${modelConfig.name} (${candidateId})`,  // Show which model actually worked
        recommendations: parsed.recommendations || [],
        summary: parsed.summary || "",
        overallConfidence: parsed.overallConfidence || 50,
        processingTimeMs: processingTime,
        ...(isPremium && {
          marketContext: parsed.marketContext,
          strategicOutlook: parsed.strategicOutlook
        })
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`[${modelConfig.name}] Timed out with ${candidateId}`);
        lastError = "Request timed out";
        continue;
      }
      
      if (error.message === 'Rate limit exceeded') {
        throw error;  // Don't retry rate limits
      }
      
      console.error(`[${modelConfig.name}] Error with ${candidateId}:`, error.message);
      lastError = error.message;
      continue;
    }
  }
  
  // All candidates failed
  const processingTime = Date.now() - startTime;
  const errorMessage = `All Gemini models failed. Tried: ${triedModels.join(', ')}. Last error: ${lastError}`;
  console.error(`[${modelConfig.name}] ${errorMessage}`);
  
  return {
    modelId: modelConfig.id,
    modelName: modelConfig.name,
    recommendations: [],
    summary: "",
    overallConfidence: 0,
    processingTimeMs: processingTime,
    error: errorMessage
  };
}

// Query Claude via Anthropic API
async function queryClaudeModel(
  prompt: string,
  apiKey: string,
  isPremium: boolean,
  timeoutMs: number = 60000
): Promise<ModelResponse> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  console.log(`[${ALL_MODELS.claude.name}] Starting query via Anthropic API...`);
  
  const modelConfig = ALL_MODELS.claude;
  
  try {
    const recommendationCount = isPremium ? "4-5" : "2-3";
    
    const systemPrompt = `You are a senior business strategist providing actionable recommendations.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice

If no business context is provided, give general best-practice recommendations.

Analyze the user's business question and provide ${recommendationCount} concrete, actionable recommendations.
Each recommendation should be practical and implementable.
Be specific with numbers, timeframes, and concrete steps.
Consider both opportunities and risks.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.id,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        tools: [getClaudeRecommendationTool(isPremium)],
        tool_choice: { type: "tool", name: "provide_recommendations" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Claude] Error ${response.status}:`, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Claude returns tool_use in content array
    const toolBlock = data.content?.find((block: any) => block.type === "tool_use");
    if (!toolBlock?.input) {
      console.error(`[Claude] No tool_use block in response`);
      throw new Error("No structured response from Claude");
    }

    const parsed = toolBlock.input;
    const processingTime = Date.now() - startTime;
    
    console.log(`[Claude] Completed in ${processingTime}ms with ${parsed.recommendations?.length || 0} recommendations`);
    
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || "",
      overallConfidence: parsed.overallConfidence || 50,
      processingTimeMs: processingTime
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`[Claude] Timed out after ${processingTime}ms`);
      return {
        modelId: modelConfig.id,
        modelName: modelConfig.name,
        recommendations: [],
        summary: "",
        overallConfidence: 0,
        processingTimeMs: processingTime,
        error: "Request timed out"
      };
    }
    
    console.error(`[Claude] Failed after ${processingTime}ms:`, error.message);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: [],
      summary: "",
      overallConfidence: 0,
      processingTimeMs: processingTime,
      error: error.message
    };
  }
}

// Query Perplexity API with web search
async function queryPerplexityModel(
  modelConfig: { id: string; name: string; gateway: 'openai' | 'google' | 'anthropic' | 'perplexity'; characteristics: { reasoning: string; tendency: string; strengths: string[] } },
  prompt: string,
  apiKey: string,
  isPremium: boolean,
  timeoutMs: number = 90000
): Promise<ModelResponse> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  console.log(`[Perplexity ${modelConfig.name}] Starting query with web search...`);
  
  try {
    const recommendationCount = isPremium ? "4-5" : "2-3";
    
    const systemPrompt = `You are a senior business strategist with access to real-time web data.
    
Your style: ${modelConfig.characteristics.tendency}
Your strengths: ${modelConfig.characteristics.strengths.join(', ')}

CRITICAL INSTRUCTION - BUSINESS CONTEXT:
The user's query may contain a "BUSINESS CONTEXT" section with specific information about their company:
- Industry, company stage, team size, and revenue range
- Target market (B2B/B2C) and geographic focus
- Website URL and/or website analysis summary

You MUST tailor ALL your recommendations specifically to this context:
- Adjust advice based on company stage (e.g., idea stage vs. Series A)
- Consider team size constraints when suggesting resources
- Factor in revenue range for budget-related recommendations
- Align strategies with target market (B2B vs B2C approaches differ)
- Consider geographic focus for market-specific advice
- If a company website is provided, consider what you know about similar companies in that space

If no business context is provided, give general best-practice recommendations based on current market trends.

Analyze the user's business question using current market data and trends.
Provide ${recommendationCount} concrete, actionable recommendations.
Focus on recent developments and current industry benchmarks.
Include relevant statistics and data points from your web search.

IMPORTANT: Structure your response as valid JSON with these exact fields:
{
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "confidence": number (0-100),
      "riskLevel": number (1-5),
      "creativityLevel": number (1-5),
      "reasoning": "string",
      "actionItems": ["string"],
      "potentialRisks": ["string"],
      "timeframe": "string"
    }
  ],
  "summary": "string",
  "overallConfidence": number (0-100)
}`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelConfig.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        search_recency_filter: "week"
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Perplexity] Error ${response.status}:`, errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];
    
    console.log(`[Perplexity] Got response with ${citations.length} citations`);
    
    // Try to parse JSON from content
    let parsed;
    try {
      // Extract JSON from content (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(`[Perplexity] Failed to parse JSON response, creating structured response`);
      // Create a structured response from unstructured text
      parsed = {
        recommendations: [{
          title: "Web Research Summary",
          description: content.substring(0, 500),
          confidence: 70,
          riskLevel: 3,
          creativityLevel: 3,
          reasoning: "Based on current web research and market data",
          actionItems: ["Review the detailed analysis", "Validate with additional sources"],
          potentialRisks: ["Data may change as market evolves"],
          timeframe: "Immediate review recommended"
        }],
        summary: content.substring(0, 300),
        overallConfidence: 70
      };
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`[Perplexity ${modelConfig.name}] Completed in ${processingTime}ms with ${parsed.recommendations?.length || 0} recommendations`);
    
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || "",
      overallConfidence: parsed.overallConfidence || 50,
      processingTimeMs: processingTime,
      citations: citations
    };

  } catch (error: any) {
    clearTimeout(timeoutId);
    const processingTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`[Perplexity] Timed out after ${processingTime}ms`);
      return {
        modelId: modelConfig.id,
        modelName: modelConfig.name,
        recommendations: [],
        summary: "",
        overallConfidence: 0,
        processingTimeMs: processingTime,
        error: "Request timed out",
        citations: []
      };
    }
    
    console.error(`[Perplexity] Failed after ${processingTime}ms:`, error.message);
    return {
      modelId: modelConfig.id,
      modelName: modelConfig.name,
      recommendations: [],
      summary: "",
      overallConfidence: 0,
      processingTimeMs: processingTime,
      error: error.message,
      citations: []
    };
  }
}

// Helper function to send SSE
function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(message));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== CODE-LEVEL JWT VERIFICATION ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Direct API keys (no more Lovable Gateway)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const googleApiKey = Deno.env.get('GEMINI_API_KEY');
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    // Validate required API keys
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    if (!googleApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Create auth client with user's token for JWT verification
    const token = authHeader.slice('Bearer '.length);
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    });

    // Verify JWT via getClaims (works with ES256 signing keys)
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT verification failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      console.error('No user ID in JWT claims');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token claims' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create user object for compatibility with existing code
    const user = { id: userId };
    
    console.log('Multi-AI query started for user:', userId);

    const { 
      prompt, 
      riskPreference = 3, 
      selectedModels,
      modelWeights,
      streaming = true,
      businessContext
    } = await req.json();

    // Validate request
    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "Please provide a business question" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate selectedModels
    if (!selectedModels || !Array.isArray(selectedModels) || selectedModels.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Exactly 3 models must be selected" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate all selected models exist
    for (const modelKey of selectedModels) {
      if (!ALL_MODELS[modelKey]) {
        return new Response(
          JSON.stringify({ error: `Unknown model: ${modelKey}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate modelWeights
    if (!modelWeights || typeof modelWeights !== 'object') {
      return new Response(
        JSON.stringify({ error: "Model weights must be provided" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check minimum 10% per model
    for (const modelKey of selectedModels) {
      const weight = modelWeights[modelKey] || 0;
      if (weight < 10) {
        return new Response(
          JSON.stringify({ error: `Each model must have at least 10% weight (${modelKey} has ${weight}%)` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (weight > 80) {
        return new Response(
          JSON.stringify({ error: `Each model can have at most 80% weight (${modelKey} has ${weight}%)` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const weightSum = selectedModels.reduce((sum: number, key: string) => sum + (modelWeights[key] || 0), 0);
    if (Math.abs(weightSum - 100) > 1) {
      return new Response(
        JSON.stringify({ error: `Model weights must sum to 100% (got ${weightSum}%)` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Claude or Perplexity is selected but API key is missing
    if (selectedModels.includes('claude') && !claudeApiKey) {
      return new Response(
        JSON.stringify({ error: "Claude API key not configured. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if ((selectedModels.includes('perplexity') || selectedModels.includes('sonarReasoning')) && !perplexityApiKey) {
      return new Response(
        JSON.stringify({ error: "Perplexity API key not configured for Sonar models. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Multi-AI query started for user ${user.id} with models: ${selectedModels.join(', ')}`);
    const totalStartTime = Date.now();

    // Check user limits
    const { data: creditsData } = await supabase
      .from('user_credits')
      .select('is_premium, validation_count, validation_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    const isPremium = creditsData?.is_premium ?? false;
    const validationLimit = isPremium ? 10 : 2;
    
    console.log(`User ${user.id} is ${isPremium ? 'PREMIUM' : 'FREE'} - using ${isPremium ? 'enhanced' : 'standard'} analysis`);
    
    // Check if within 24h window
    const now = new Date();
    const windowStart = creditsData?.validation_window_start ? new Date(creditsData.validation_window_start) : null;
    const windowExpired = !windowStart || now.getTime() - windowStart.getTime() > 24 * 60 * 60 * 1000;
    const currentCount = windowExpired ? 0 : (creditsData?.validation_count ?? 0);

    if (currentCount >= validationLimit) {
      const windowEndsAt = new Date(windowStart!.getTime() + 24 * 60 * 60 * 1000);
      return new Response(
        JSON.stringify({ 
          error: "LIMIT_REACHED",
          isPremium,
          currentCount,
          limit: validationLimit,
          resetAt: windowEndsAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format business context for AI prompts
    function formatBusinessContext(ctx: any): string {
      if (!ctx) {
        console.log('[BusinessContext] No context provided');
        return '';
      }
      
      const parts: string[] = [];
      
      if (ctx.industry) {
        const industryLabels: Record<string, string> = {
          'saas': 'SaaS', 'ecommerce': 'E-Commerce', 'fintech': 'FinTech',
          'healthtech': 'HealthTech', 'edtech': 'EdTech', 'marketplace': 'Marketplace',
          'agency': 'Agency', 'consulting': 'Consulting', 'manufacturing': 'Manufacturing', 'other': 'Other'
        };
        parts.push(`Industry: ${industryLabels[ctx.industry] || ctx.industry}`);
      }
      
      if (ctx.company_stage) {
        const stageLabels: Record<string, string> = {
          'idea': 'Idea Stage', 'pre-seed': 'Pre-Seed', 'seed': 'Seed',
          'series-a': 'Series A', 'series-b-plus': 'Series B+', 
          'growth': 'Growth Stage', 'established': 'Established'
        };
        parts.push(`Company Stage: ${stageLabels[ctx.company_stage] || ctx.company_stage}`);
      }
      
      if (ctx.team_size) {
        parts.push(`Team Size: ${ctx.team_size} people`);
      }
      
      if (ctx.revenue_range) {
        const revenueLabels: Record<string, string> = {
          'pre-revenue': 'Pre-revenue', 'less-10k': 'Less than $10k/month',
          '10k-50k': '$10k-50k/month', '50k-100k': '$50k-100k/month', '100k-plus': '$100k+/month'
        };
        parts.push(`Revenue: ${revenueLabels[ctx.revenue_range] || ctx.revenue_range}`);
      }
      
      if (ctx.target_market) {
        const marketLabels: Record<string, string> = {
          'b2b': 'B2B', 'b2c': 'B2C', 'b2b2c': 'B2B2C', 'd2c': 'D2C'
        };
        parts.push(`Target Market: ${marketLabels[ctx.target_market] || ctx.target_market}`);
      }
      
      if (ctx.geographic_focus) {
        const geoLabels: Record<string, string> = {
          'local': 'Local', 'national': 'National', 'eu': 'European Union', 
          'us': 'United States', 'global': 'Global'
        };
        parts.push(`Geographic Focus: ${geoLabels[ctx.geographic_focus] || ctx.geographic_focus}`);
      }
      
      // Include website URL even if no summary is available
      if (ctx.website_url) {
        parts.push(`Company Website: ${ctx.website_url}`);
      }
      
      if (ctx.website_summary) {
        parts.push(`Website Analysis: ${ctx.website_summary}`);
      }
      
      if (parts.length === 0) {
        console.log('[BusinessContext] Context object provided but all fields empty');
        return '';
      }
      
      const contextString = `
- BUSINESS CONTEXT (MANDATORY - Tailor ALL recommendations specifically to this context):
  ${parts.join('\n  ')}`;
      
      // Debug logging
      console.log('[BusinessContext] Formatted context for AI:', contextString);
      
      return contextString;
    }

    // Prepare the enhanced prompt with user context + business context
    // IMPORTANT: Business context is placed at the BEGINNING for better model attention
    const contextString = formatBusinessContext(businessContext);
    
    // Log specifically for GPT Mini debugging
    if (selectedModels.includes('gptMini')) {
      console.log('[GPT-Mini-Debug] Business context for GPT Mini:', contextString ? 'PROVIDED' : 'EMPTY');
      if (businessContext?.website_url) {
        console.log('[GPT-Mini-Debug] Website URL:', businessContext.website_url);
      }
      if (businessContext?.website_summary) {
        console.log('[GPT-Mini-Debug] Website Summary length:', businessContext.website_summary.length, 'chars');
      }
    }
    
    const enhancedPrompt = contextString 
      ? `${contextString}

---

USER'S QUESTION:
${prompt}

---

ANALYSIS PREFERENCES:
- User prefers ${riskPreference <= 2 ? 'conservative' : riskPreference >= 4 ? 'aggressive/bold' : 'balanced'} recommendations
- Remember: Your recommendations MUST be tailored to the BUSINESS CONTEXT above`
      : `${prompt}

Context for your analysis:
- User prefers ${riskPreference <= 2 ? 'conservative' : riskPreference >= 4 ? 'aggressive/bold' : 'balanced'} recommendations`;

    if (streaming) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const modelResponses: Record<string, ModelResponse> = {};

            sendSSE(controller, 'status', { message: 'Starting AI models...', phase: 'starting' });

            console.log('Starting parallel model queries...');

            // Query all selected models in parallel
            const modelPromises = selectedModels.map(async (modelKey: string) => {
              const modelConfig = ALL_MODELS[modelKey];
              sendSSE(controller, 'model_started', { model: modelKey, name: modelConfig.name });
              
              let response: ModelResponse;
              
              switch (modelConfig.gateway) {
                case 'openai':
                  response = await queryOpenAIModel(modelKey, modelConfig, enhancedPrompt, openaiApiKey!, isPremium, 90000);
                  break;
                case 'google':
                  response = await queryGoogleModel(modelKey, modelConfig, enhancedPrompt, googleApiKey!, isPremium, 90000);
                  break;
                case 'anthropic':
                  response = await queryClaudeModel(enhancedPrompt, claudeApiKey!, isPremium, 90000);
                  break;
                case 'perplexity':
                  response = await queryPerplexityModel(modelConfig, enhancedPrompt, perplexityApiKey!, isPremium, 90000);
                  break;
                default:
                  throw new Error(`Unknown gateway: ${modelConfig.gateway}`);
              }
              
              modelResponses[modelKey] = response;
              console.log(`[${modelConfig.name}] Sending model_complete SSE (error: ${response.error || 'none'})`);
              sendSSE(controller, 'model_complete', { model: modelKey, response });
              return { modelKey, response };
            });

            await Promise.allSettled(modelPromises);

            const totalProcessingTime = Date.now() - totalStartTime;

            // Update user credits atomically
            await supabase.rpc('increment_validation_count', {
              user_uuid: user.id,
              reset_window: windowExpired
            });

            // Send final combined response
            sendSSE(controller, 'complete', {
              modelResponses,
              selectedModels,
              modelWeights,
              processingTimeMs: totalProcessingTime,
              userPreferences: { riskPreference },
              isPremium
            });

            controller.close();
          } catch (error: any) {
            console.error('Streaming error:', error);
            sendSSE(controller, 'error', { error: error.message });
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no'
        }
      });

    } else {
      // Non-streaming response
      const modelResponses: Record<string, ModelResponse> = {};

      const modelPromises = selectedModels.map(async (modelKey: string) => {
        const modelConfig = ALL_MODELS[modelKey];
        let response: ModelResponse;
        
        switch (modelConfig.gateway) {
          case 'openai':
            response = await queryOpenAIModel(modelKey, modelConfig, enhancedPrompt, openaiApiKey!, isPremium, 90000);
            break;
          case 'google':
            response = await queryGoogleModel(modelKey, modelConfig, enhancedPrompt, googleApiKey!, isPremium, 90000);
            break;
          case 'anthropic':
            response = await queryClaudeModel(enhancedPrompt, claudeApiKey!, isPremium, 90000);
            break;
          case 'perplexity':
            response = await queryPerplexityModel(modelConfig, enhancedPrompt, perplexityApiKey!, isPremium, 90000);
            break;
          default:
            throw new Error(`Unknown gateway: ${modelConfig.gateway}`);
        }
        
        modelResponses[modelKey] = response;
        return { modelKey, response };
      });

      await Promise.allSettled(modelPromises);

      const totalProcessingTime = Date.now() - totalStartTime;

      // Update user credits
      const updateData: any = {
        validation_count: windowExpired ? 1 : currentCount + 1,
      };
      if (windowExpired) {
        updateData.validation_window_start = now.toISOString();
      }
      
      await supabase
        .from('user_credits')
        .update(updateData)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({
          modelResponses,
          selectedModels,
          modelWeights,
          processingTimeMs: totalProcessingTime,
          userPreferences: { riskPreference },
          isPremium
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Multi-AI query error:', error);
    
    if (error.message === 'Rate limit exceeded') {
      return new Response(
        JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (error.message === 'Payment required') {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
