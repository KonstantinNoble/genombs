import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdCampaignRecommendation {
  name: string;
  category: string;
  implementation: string;
  estimatedCost: string;
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
  industry: z.string().trim().min(1, "Industry is required"),
  targetAudience: z.string().trim().min(1, "Target audience is required"),
  advertisingBudget: z.string().trim().min(1, "Budget is required"),
  advertisingGoals: z.string().trim().min(1, "Goals are required").max(100, "Goals must be 100 characters or less"),
  
  // Premium/Deep mode fields
  currentChannels: z.string().optional(),
  geographicTarget: z.string().optional(),
  competitorStrategy: z.string().optional(),
  specificRequirements: z.string().max(100, "Requirements must be 100 characters or less").optional(),
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
    console.log('Ads advisor request received');

    // Parse request early to get analysis mode
    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";

    // Get user's premium status and ADS-SPECIFIC counts
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, ads_deep_analysis_count, ads_deep_analysis_window_start, ads_standard_analysis_count, ads_standard_analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    const isPremium = creditsData?.is_premium ?? false;
    
    // Set limits based on premium status
    const deepLimit = isPremium ? 2 : 0;
    const standardLimit = isPremium ? 6 : 2;

    // Check limit for the selected mode (ADS-SPECIFIC)
    if (isDeepMode) {
      const currentDeepCount = creditsData?.ads_deep_analysis_count ?? 0;
      const deepWindowStart = creditsData?.ads_deep_analysis_window_start;
      
      if (deepWindowStart) {
        const windowEndsAt = new Date(new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentDeepCount >= deepLimit) {
          console.log(`⛔ Deep analysis limit reached: ${currentDeepCount}/${deepLimit}`);
          console.log(`⏰ Window ends at: ${windowEndsAt.toISOString()}`);
          
          return new Response(
            JSON.stringify({ 
              error: `Deep analysis limit reached (${currentDeepCount}/${deepLimit}). Next available at ${windowEndsAt.toISOString()}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`✅ Deep analysis allowed. Current count: ${currentDeepCount}/${deepLimit}`);
    } else {
      const currentStandardCount = creditsData?.ads_standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.ads_standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          console.log(`⛔ Standard analysis limit reached: ${currentStandardCount}/${standardLimit}`);
          console.log(`⏰ Window ends at: ${windowEndsAt.toISOString()}`);
          
          return new Response(
            JSON.stringify({ 
              error: `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Next available at ${windowEndsAt.toISOString()}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`✅ Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    // Validate input
    const validatedInput = inputSchema.parse(requestBody);
    const { industry, targetAudience, advertisingBudget, advertisingGoals, currentChannels, competitorStrategy, geographicTarget, specificRequirements, analysisMode } = validatedInput;
    
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
      ? `You are a senior advertising strategist. Create a comprehensive 3-PHASE advertising strategy.

PHASE STRUCTURE:
Phase 1 (Month 1-2): FOUNDATION
- Establish market presence
- Test messaging and targeting
- Collect baseline data
- Budget: 40% of total

Phase 2 (Month 3-4): EXPANSION  
- Scale what works from Phase 1
- Add complementary channels
- Begin retargeting
- Budget: 35% of total

Phase 3 (Month 5-6): OPTIMIZATION
- Multi-channel integration
- Advanced audience segmentation
- Maximize ROI
- Budget: 25% of total

PROVIDE EXACTLY 3 CAMPAIGNS (one per phase) that build on each other sequentially.

${currentChannels ? `Current Channels: ${currentChannels}` : ''}
${competitorStrategy ? `Competitor Strategy: ${competitorStrategy}` : ''}
${geographicTarget ? `Geographic Target: ${geographicTarget}` : ''}
${specificRequirements ? `Specific Requirements: ${specificRequirements}` : ''}

CRITICAL OUTPUT REQUIREMENTS:
1. Use clean, professional English
2. NEVER use special characters: ★ ✓ → • ✨ 💡 📊 ⚡ ♦ ► etc.
3. Use simple dashes (-) for bullet points ONLY in arrays
4. Use plain text only - NO bold (**text**) or italics in rationale field
5. Each campaign's rationale MUST reference previous phases
6. Numbers and percentages: plain format (e.g., "5-10%", "$500-1000")
7. For generalAdvice: Explain the strategic progression and why this phased approach works

Each campaign should include:
- detailedSteps: Implementation steps for THIS phase
- expectedROI: Cumulative ROI (building on previous phases)
- riskLevel: Risk assessment for this phase
- prerequisites: What must be completed from previous phases
- metrics: KPIs specific to this phase
- implementationTimeline: Duration of this phase

Focus on practical advertising campaigns (Google Ads, Facebook, Instagram, LinkedIn, TikTok, YouTube, Display Ads).
Use the suggest_campaigns function.`
      : `You are a strategic advertising consultant. Create a focused, cohesive advertising plan.

STRATEGY REQUIREMENTS:
- Provide 2-3 campaigns that work together as ONE strategy
- First campaign must be the PRIMARY traffic driver
- Additional campaigns should SUPPORT and COMPLEMENT the primary
- Explain how campaigns interconnect and reinforce each other

OUTPUT STRUCTURE:
1. PRIMARY Campaign: Main channel with highest budget allocation (60-70%)
2. SUPPORTING Campaign(s): Complementary channels (30-40% combined)

CRITICAL OUTPUT REQUIREMENTS:
1. Use clean, professional English
2. NEVER use special characters: ★ ✓ → • ✨ 💡 📊 ⚡ ♦ ► etc.
3. Use simple dashes (-) for bullet points ONLY in arrays
4. Use plain text only - NO bold (**text**) or italics in rationale field
5. Keep rationale concise but strategic (4-5 sentences showing how campaigns connect)
6. Numbers and percentages: plain format (e.g., "5-10%", "$500-1000")
7. For generalAdvice: Provide a strategic overview explaining campaign synergies

Focus on creating ONE cohesive strategy, not separate isolated campaigns.
Focus on practical advertising campaigns relevant to the budget and goals.
Use the suggest_campaigns function.`;

    let userPromptText = `Industry: ${industry}
Target Audience: ${targetAudience}
Monthly Advertising Budget: ${advertisingBudget}
Advertising Goals: ${advertisingGoals}`;

    // Add premium fields to user prompt if available
    if (currentChannels) userPromptText += `\nCurrent Channels: ${currentChannels}`;
    if (competitorStrategy) userPromptText += `\nCompetitor Strategy: ${competitorStrategy}`;
    if (geographicTarget) userPromptText += `\nGeographic Target: ${geographicTarget}`;
    if (specificRequirements) userPromptText += `\nSpecific Requirements: ${specificRequirements}`;

    userPromptText += `\n\nProvide personalized advertising campaign recommendations. Focus on ROI and practical implementation.`;

    const userPrompt = userPromptText;

    console.log('🤖 Calling AI (model: google/gemini-2.5-flash, mode: ' + (isDeepMode ? 'deep' : 'standard') + ')...');

    const toolProperties: any = {
      name: { type: 'string', description: 'Campaign name (clear, descriptive)' },
      category: {
        type: 'string',
        enum: ['google-ads', 'facebook-ads', 'instagram-ads', 'linkedin-ads', 'tiktok-ads', 'youtube-ads', 'display-ads'],
        description: 'Advertising platform'
      },
      implementation: {
        type: 'string',
        enum: ['immediate', 'short-term', 'long-term'],
        description: 'When to start'
      },
      estimatedCost: { type: 'string', description: 'Cost estimate (e.g., "$1000-2500 per month")' },
      rationale: { type: 'string', description: 'Why this campaign (3-4 sentences, plain text, no special characters)' }
    };

    if (isDeepMode) {
      toolProperties.detailedSteps = {
        type: 'array',
        items: { type: 'string' },
        description: 'Step-by-step implementation guide'
      };
      toolProperties.expectedROI = { type: 'string', description: 'ROI projection (e.g., "5-10% ROI in 3-6 months")' };
      toolProperties.riskLevel = {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Risk assessment'
      };
      toolProperties.prerequisites = {
        type: 'array',
        items: { type: 'string' },
        description: 'Requirements before starting'
      };
      toolProperties.metrics = {
        type: 'array',
        items: { type: 'string' },
        description: 'KPIs to track (e.g., "Click-through rate", "Cost per acquisition")'
      };
      toolProperties.implementationTimeline = { type: 'string', description: 'Time to set up (e.g., "2-3 weeks")' };
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_campaigns',
            description: 'Suggest advertising campaigns based on website, budget, and goals',
            parameters: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: toolProperties,
                    required: ['name', 'category', 'implementation', 'estimatedCost', 'rationale']
                  }
                },
                generalAdvice: {
                  type: 'string',
                  description: 'Overall advertising strategy (5-7 sentences, plain text, proper paragraph breaks)'
                }
              },
              required: ['recommendations', 'generalAdvice']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_campaigns' } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    if (!aiData.choices?.[0]?.message?.tool_calls?.[0]) {
      console.error('Unexpected AI response structure:', JSON.stringify(aiData));
      throw new Error('Invalid AI response');
    }

    const toolCall = aiData.choices[0].message.tool_calls[0];
    const recommendations = JSON.parse(toolCall.function.arguments);

    console.log(`📦 Generated ${recommendations.recommendations?.length || 0} campaign recommendations`);

    // Save to ads_advisor_history
    const { error: insertError } = await supabase
      .from('ads_advisor_history')
      .insert({
        user_id: user.id,
        industry,
        target_audience: targetAudience,
        advertising_budget: advertisingBudget,
        advertising_goals: advertisingGoals,
        current_channels: currentChannels,
        competitor_strategy: competitorStrategy,
        geographic_target: geographicTarget,
        specific_requirements: specificRequirements,
        website_url: '',
        result: recommendations,
        analysis_mode: isDeepMode ? 'deep' : 'standard'
      });

    if (insertError) {
      console.error('Failed to save history:', insertError);
      throw new Error('Failed to save analysis');
    }

    // Update ADS-SPECIFIC credits
    const now = new Date().toISOString();
    const currentCount = isDeepMode 
      ? (creditsData?.ads_deep_analysis_count ?? 0)
      : (creditsData?.ads_standard_analysis_count ?? 0);

    const windowStart = isDeepMode
      ? (creditsData?.ads_deep_analysis_window_start)
      : (creditsData?.ads_standard_analysis_window_start);

    // Determine if we need to reset the window
    let newWindowStart = windowStart;
    if (!windowStart || (new Date().getTime() - new Date(windowStart).getTime()) > 24 * 60 * 60 * 1000) {
      newWindowStart = now;
    }

    const newCount = (!windowStart || newWindowStart === now) ? 1 : currentCount + 1;

    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        [isDeepMode ? 'ads_deep_analysis_count' : 'ads_standard_analysis_count']: newCount,
        [isDeepMode ? 'ads_deep_analysis_window_start' : 'ads_standard_analysis_window_start']: newWindowStart,
        updated_at: now
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Request completed in ${duration}ms`);
    console.log(`📊 New count: ${newCount}/${isDeepMode ? deepLimit : standardLimit}`);

    return new Response(
      JSON.stringify(recommendations),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ads-advisor function:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
