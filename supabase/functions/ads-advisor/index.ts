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
  // Deep mode exclusive fields
  phase?: string; // "Phase 1 (Month 1-2): FOUNDATION" | "Phase 2 (Month 3-4): EXPANSION" | "Phase 3 (Month 5-6): OPTIMIZATION"
  detailedSteps?: string[];
  expectedROI?: string;
  riskLevel?: string;
  prerequisites?: string[];
  metrics?: string[];
  implementationTimeline?: string;
  competitiveAdvantage?: string;
  testingStrategy?: string[];
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
          
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ 
              error: `Deep analysis limit reached (${currentDeepCount}/${deepLimit}). Try again in ${timeMessage}.`
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
          
          const hoursRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60 * 60));
          const minutesRemaining = Math.ceil((windowEndsAt.getTime() - Date.now()) / (1000 * 60));
          const timeMessage = hoursRemaining >= 1 
            ? `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
            : `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          
          return new Response(
            JSON.stringify({ 
              error: `Standard analysis limit reached (${currentStandardCount}/${standardLimit}). Try again in ${timeMessage}.`
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
      ? `You are a senior advertising strategist specializing in long-term campaign architecture. Create a comprehensive 6-MONTH, 3-PHASE advertising strategy.

PREMIUM DEEP MODE REQUIREMENTS:
You MUST provide EXACTLY 3 campaigns - one for each phase of the 6-month roadmap.

PHASE STRUCTURE (CRITICAL - Each campaign must specify its phase):
Phase 1 (Month 1-2): FOUNDATION
- Goal: Establish market presence and collect baseline data
- Focus: Testing messaging, audience validation, initial brand awareness
- Budget Distribution: 40% of total budget
- Risk: Medium (learning phase)

Phase 2 (Month 3-4): EXPANSION  
- Goal: Scale proven tactics from Phase 1
- Focus: Expand to complementary channels, begin retargeting
- Budget Distribution: 35% of total budget
- Risk: Low-Medium (data-driven scaling)

Phase 3 (Month 5-6): OPTIMIZATION
- Goal: Multi-channel integration and ROI maximization
- Focus: Advanced segmentation, automation, conversion optimization
- Budget Distribution: 25% of total budget
- Risk: Low (refined approach)

MANDATORY FIELDS FOR EACH CAMPAIGN:
1. phase: MUST be one of:
   - "Phase 1 (Month 1-2): FOUNDATION"
   - "Phase 2 (Month 3-4): EXPANSION"
   - "Phase 3 (Month 5-6): OPTIMIZATION"

2. competitiveAdvantage: Explain how this campaign positions the business against competitors. Consider:
   ${competitorStrategy ? `- Competitor insight: ${competitorStrategy}` : '- Market differentiation strategies'}
   - Unique value proposition in this channel
   - Defensive moats being built

3. testingStrategy: Array of 3-4 specific A/B tests to run during this phase
   - Example: "Test headline: Feature-focused vs. Benefit-focused"
   - Example: "Test audience: Broad targeting vs. Interest-based segments"

4. detailedSteps: 5-7 implementation steps specific to THIS phase
5. expectedROI: Cumulative ROI projection considering all previous phases
6. riskLevel: Risk assessment for this specific phase
7. prerequisites: What MUST be completed from previous phases before starting
8. metrics: 4-6 KPIs specific to tracking this phase's success
9. implementationTimeline: Realistic setup duration for this phase

${currentChannels ? `Current Channels: ${currentChannels} - Analyze how to leverage or complement these.` : ''}
${geographicTarget ? `Geographic Target: ${geographicTarget} - Tailor campaigns to this market.` : ''}
${specificRequirements ? `Special Requirements: ${specificRequirements}` : ''}

CRITICAL OUTPUT REQUIREMENTS:
1. Professional English, zero special characters (★ ✓ → • ✨ etc.)
2. Plain text only - NO markdown formatting
3. Each campaign's rationale MUST explain how it builds on previous phases
4. generalAdvice: Provide a detailed 6-month roadmap including:
   - Budget distribution across phases
   - Key milestones for each phase
   - Synergies between channels
   - Risk mitigation strategies
   - Expected cumulative results by month 6
   - When to pivot or scale back

Focus on practical advertising platforms: Google Ads, Facebook, Instagram, LinkedIn, TikTok, YouTube, Display Ads.
Use the suggest_campaigns function.`
      : `You are a strategic advertising consultant. Create a focused, immediate-action advertising plan.

STANDARD MODE REQUIREMENTS:
Provide EXACTLY 2 campaigns that work as a unified quick-start strategy.

CAMPAIGN STRUCTURE:
1. PRIMARY Campaign: Main traffic driver (60-70% of budget)
   - Must be the fastest to implement
   - Highest expected ROI in first 30 days
   
2. SUPPORTING Campaign: Complementary channel (30-40% of budget)
   - Reinforces the primary campaign
   - Different audience touchpoint
   - Creates retargeting opportunities

CRITICAL OUTPUT REQUIREMENTS:
1. Professional English, zero special characters (★ ✓ → • ✨ etc.)
2. Plain text only - NO markdown formatting
3. Keep rationale focused (3-4 sentences explaining campaign synergy)
4. Numbers in plain format: "5-10%", "$500-1000"
5. generalAdvice: Provide a concise strategic overview (5-7 sentences) covering:
   - Why these 2 campaigns work together
   - Expected timeline to see results
   - Key success metrics to watch
   - One quick optimization tip

Focus on immediate-action campaigns for quick wins.
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
      estimatedCost: { type: 'string', description: 'Cost estimate with breakdown (e.g., "$1000-2500/month" or for deep mode: "$1500-2000/month - Setup: $500, Monthly: $1000-1500")' },
      rationale: { type: 'string', description: 'Why this campaign (3-4 sentences, plain text, no special characters)' }
    };

    if (isDeepMode) {
      toolProperties.phase = {
        type: 'string',
        enum: ['Phase 1 (Month 1-2): FOUNDATION', 'Phase 2 (Month 3-4): EXPANSION', 'Phase 3 (Month 5-6): OPTIMIZATION'],
        description: 'REQUIRED: Which phase this campaign belongs to'
      };
      toolProperties.competitiveAdvantage = {
        type: 'string',
        description: 'REQUIRED: How this campaign positions against competitors (3-4 sentences)'
      };
      toolProperties.testingStrategy = {
        type: 'array',
        items: { type: 'string' },
        description: 'REQUIRED: 3-4 specific A/B tests to run in this phase',
        minItems: 3,
        maxItems: 4
      };
      toolProperties.detailedSteps = {
        type: 'array',
        items: { type: 'string' },
        description: 'Step-by-step implementation (5-7 steps)',
        minItems: 5,
        maxItems: 7
      };
      toolProperties.expectedROI = { type: 'string', description: 'Cumulative ROI projection considering previous phases (e.g., "8-12% cumulative ROI by end of phase")' };
      toolProperties.riskLevel = {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Risk assessment for this phase'
      };
      toolProperties.prerequisites = {
        type: 'array',
        items: { type: 'string' },
        description: 'What must be completed from previous phases',
        minItems: 1
      };
      toolProperties.metrics = {
        type: 'array',
        items: { type: 'string' },
        description: 'Phase-specific KPIs to track (4-6 metrics)',
        minItems: 4,
        maxItems: 6
      };
      toolProperties.implementationTimeline = { type: 'string', description: 'Setup duration for this phase (e.g., "3-4 weeks")' };
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
                    required: isDeepMode 
                      ? ['name', 'category', 'implementation', 'estimatedCost', 'rationale', 'phase', 'competitiveAdvantage', 'testingStrategy', 'detailedSteps', 'expectedROI', 'riskLevel', 'prerequisites', 'metrics', 'implementationTimeline']
                      : ['name', 'category', 'implementation', 'estimatedCost', 'rationale']
                  },
                  minItems: isDeepMode ? 3 : 2,
                  maxItems: isDeepMode ? 3 : 2,
                  description: isDeepMode ? 'Exactly 3 campaigns (one per phase)' : 'Exactly 2 campaigns (primary + supporting)'
                },
                generalAdvice: {
                  type: 'string',
                  description: isDeepMode 
                    ? 'Comprehensive 6-month roadmap covering: budget distribution across phases, key milestones, channel synergies, risk mitigation, cumulative results projection, and pivot indicators. (10-15 sentences, plain text, proper paragraph breaks)'
                    : 'Strategic overview explaining campaign synergy, expected timeline, key metrics, and one optimization tip. (5-7 sentences, plain text)'
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
