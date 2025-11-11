import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IdeaRecommendation {
  name: string;
  category: string;
  viability: string;
  estimatedInvestment: string;
  rationale: string;
  // Deep mode fields
  detailedSteps?: string[];
  expectedROI?: string;
  riskLevel?: string;
  prerequisites?: string[];
  metrics?: string[];
  implementationTimeline?: string;
}

// Input validation schema
const inputSchema = z.object({
  websiteType: z.string().trim().min(1).max(100),
  websiteStatus: z.string().trim().min(1).max(50),
  budgetRange: z.string().trim().min(1).max(50),
  businessContext: z.string().trim().min(1).max(1000),
  // Premium-only fields
  targetAudience: z.string().optional(),
  competitionLevel: z.string().optional(),
  growthStage: z.string().optional(),
  analysisMode: z.enum(["standard", "deep"]).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const startTime = Date.now();
    console.log('Business ideas request received');

    // Check credits
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, ideas_count, ideas_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    const now = new Date();
    const isPremium = creditsData?.is_premium ?? false;
    const limit = isPremium ? 8 : 2;
    let currentCount = creditsData?.ideas_count ?? 0;
    let windowStart = creditsData?.ideas_window_start ? new Date(creditsData.ideas_window_start) : null;

    // Check if window expired
    if (windowStart && (now.getTime() - windowStart.getTime()) > 24 * 60 * 60 * 1000) {
      console.log('Window expired, resetting');
      currentCount = 0;
      windowStart = null;
    }

    // Block if limit reached
    if (currentCount >= limit) {
      console.log(`Limit reached: ${currentCount}/${limit}`);
      return new Response(
        JSON.stringify({ 
          error: isPremium 
            ? `Premium limit reached (${limit}/${limit}). Please wait 24 hours.` 
            : `Free limit reached (${limit}/${limit}). Upgrade to Premium for 8 analyses per day.`
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Limit check passed');

    // Parse and validate input
    const requestBody = await req.json();
    
    let validatedInput;
    try {
      validatedInput = inputSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid input', 
            details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    const { websiteType, websiteStatus, budgetRange, businessContext, targetAudience, competitionLevel, growthStage, analysisMode } = validatedInput;
    
    const isDeepMode = isPremium && analysisMode === "deep";
    
    console.log('📊 Analysis mode:', {
      isPremium,
      analysisMode: analysisMode || 'standard',
      isDeepMode
    });

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = isDeepMode
      ? `You are an ADVANCED business improvement advisor.
${targetAudience ? `Target audience: ${targetAudience}` : ''}
${competitionLevel ? `Competition level: ${competitionLevel}` : ''}
${growthStage ? `Growth stage: ${growthStage}` : ''}

CRITICAL: Return ONLY valid JSON without code fences, markdown, or any other formatting.

Provide 8-10 DETAILED, actionable improvement ideas with:
- detailedSteps: Array of concrete implementation steps
- expectedROI: ROI projection with specific timeframes
- riskLevel: "low" | "medium" | "high"
- prerequisites: What must be in place first
- metrics: How to measure success
- implementationTimeline: Time estimate

In generalAdvice, include:
- Prioritization matrix (Quick Wins first)
- Industry-specific insights
- Competitive analysis
- 3-6 month roadmap

Focus on revenue growth, efficiency, customer experience, market expansion, cost reduction, and digital transformation.`
      : `You are a business improvement advisor. Analyze the EXISTING business and provide 5-7 concise, actionable improvement recommendations.

CRITICAL: Return ONLY valid JSON without code fences or markdown.

Focus on revenue growth, efficiency, customer experience, market expansion, cost reduction, and digital transformation.`;

    const userPrompt = `Website Type: ${websiteType}
Website Status: ${websiteStatus}
Budget Range: ${budgetRange}
Current Business Context: ${businessContext}

Please provide personalized improvement recommendations to grow and optimize this EXISTING business.`;

    console.log('🤖 Calling AI (model: google/gemini-2.5-flash, mode: ' + (isDeepMode ? 'deep' : 'standard') + ')...');

    const timeout = isDeepMode ? 30000 : 20000;
    
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);

    let aiResponse: Response;
    try {
      const aiStartTime = Date.now();
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
        }),
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);
      console.log(`⏱️ AI call completed in ${Date.now() - aiStartTime}ms`);
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeout}ms`);
      }
      throw error;
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log(`✅ AI response received (total time: ${Date.now() - startTime}ms)`);

    let content = aiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Robust JSON parsing with fence removal
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      if (content.includes('```')) {
        const fenceMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (fenceMatch) {
          content = fenceMatch[1].trim();
        }
      }
      
      try {
        parsedResult = JSON.parse(content);
      } catch (e2) {
        console.error('Failed to parse JSON:', e2);
        throw new Error('Invalid response format from AI');
      }
    }

    // Validate structure
    if (!parsedResult.recommendations || !Array.isArray(parsedResult.recommendations)) {
      console.error('Invalid structure');
      throw new Error('Invalid response format from AI');
    }

    console.log(`Parsed ${parsedResult.recommendations.length} recommendations`);

    // Insert into history
    const { error: historyError } = await supabase
      .from('business_ideas_history')
      .insert({
        user_id: user.id,
        industry: websiteType,
        team_size: websiteStatus,
        budget_range: budgetRange,
        business_context: businessContext,
        result: parsedResult
      });

    if (historyError) {
      console.error('Error saving history:', historyError);
      throw new Error('Failed to save recommendations');
    }

    console.log('History saved successfully');

    // Update credits
    const newWindowStart = windowStart ?? now;
    const newCount = currentCount + 1;

    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert({
        user_id: user.id,
        ideas_count: newCount,
        ideas_window_start: newWindowStart.toISOString(),
        last_analysis_at: now.toISOString(),
        updated_at: now.toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('Error updating credits:', updateError);
    } else {
      console.log('Credits updated successfully');
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in business-ideas-advisor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
