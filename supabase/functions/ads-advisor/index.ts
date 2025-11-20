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
  websiteUrl: z.string().trim().url("Please enter a valid URL").max(200, "URL too long"),
  targetAudience: z.string().trim().min(1, "Target audience is required").max(200, "Target audience too long"),
  advertisingBudget: z.string().trim().min(1, "Budget is required").max(50),
  advertisingGoals: z.string().trim().min(1, "Goals are required").max(1000, "Goals too long"),
  
  // Premium/Deep mode fields
  currentChannels: z.string().max(200).optional(),
  competitorAds: z.string().max(300).optional(),
  geographicTarget: z.string().max(50).optional(),
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
    const { websiteUrl, targetAudience, advertisingBudget, advertisingGoals, currentChannels, competitorAds, geographicTarget, analysisMode } = validatedInput;
    
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
      ? `You are an expert digital advertising strategist specializing in comprehensive campaign planning.

${currentChannels ? `Current Channels: ${currentChannels}` : ''}
${competitorAds ? `Competitor Analysis: ${competitorAds}` : ''}
${geographicTarget ? `Geographic Target: ${geographicTarget}` : ''}

Provide 5-7 DETAILED advertising campaign recommendations with:
- detailedSteps: Array of concrete implementation steps
- expectedROI: ROI projection (e.g., "5-10% ROI in 3-6 months")
- riskLevel: "low" | "medium" | "high"
- prerequisites: What must be in place first
- metrics: Key performance indicators to track
- implementationTimeline: Time estimate for setup

CRITICAL OUTPUT REQUIREMENTS:
1. Use clean, professional English
2. NEVER use special characters: ★ ✓ → • ✨ 💡 📊 ⚡ ♦ ► etc.
3. Use simple dashes (-) for bullet points ONLY in arrays
4. Use plain text only - NO bold (**text**) or italics in rationale field
5. Keep rationale concise (3-4 clear sentences)
6. Numbers and percentages: plain format (e.g., "5-10%", "$500-1000")
7. For generalAdvice: Use proper paragraph breaks with double newlines

Focus on practical advertising campaigns (Google Ads, Facebook, Instagram, LinkedIn, TikTok, YouTube, Display Ads).
Use the suggest_campaigns function.`
      : `You are a digital advertising strategist. Provide 3-5 concise campaign recommendations.

CRITICAL OUTPUT REQUIREMENTS:
1. Use clean, professional English
2. NEVER use special characters: ★ ✓ → • ✨ 💡 📊 ⚡ ♦ ► etc.
3. Use simple dashes (-) for bullet points ONLY in arrays
4. Use plain text only - NO bold (**text**) or italics in rationale field
5. Keep rationale concise (3-4 clear sentences)
6. Numbers and percentages: plain format (e.g., "5-10%", "$500-1000")
7. For generalAdvice: Use proper paragraph breaks with double newlines

Focus on practical advertising campaigns relevant to the budget and goals.
Use the suggest_campaigns function.`;

    let userPromptText = `Website URL: ${websiteUrl}
Target Audience: ${targetAudience}
Monthly Advertising Budget: ${advertisingBudget}
Advertising Goals: ${advertisingGoals}`;

    // Add premium fields to user prompt if available
    if (currentChannels) userPromptText += `\nCurrent Channels: ${currentChannels}`;
    if (competitorAds) userPromptText += `\nCompetitor Ads: ${competitorAds}`;
    if (geographicTarget) userPromptText += `\nGeographic Target: ${geographicTarget}`;

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

    const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
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
        website_url: websiteUrl,
        target_audience: targetAudience,
        advertising_budget: advertisingBudget,
        advertising_goals: advertisingGoals,
        current_channels: currentChannels,
        competitor_ads: competitorAds,
        geographic_target: geographicTarget,
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
