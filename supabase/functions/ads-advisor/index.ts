import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdRecommendation {
  platform: string;
  adFormat: string;
  targetingStrategy: string;
  adCopyExample: string;
  estimatedCPM: string;
  estimatedCTR: string;
  budgetAllocation: string;
  detailedStrategy?: string[];
  abTestingIdeas?: string[];
  audienceSegments?: string[];
  competitorInsights?: string[];
  kpiMetrics?: string[];
  optimizationTips?: string[];
}

const inputSchema = z.object({
  platform: z.string().trim().min(1).max(50),
  campaignType: z.string().trim().min(1).max(50),
  budgetRange: z.string().trim().min(1).max(50),
  productDetails: z.string().trim().min(1).max(100),
  targetAudience: z.string().trim().min(1).max(100).optional(),
  productDescription: z.string().trim().max(100).optional(),
  analysisMode: z.enum(["standard", "deep"]).optional(),
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
    console.log('🎯 Ads advisor request received');

    const requestBody = await req.json();
    const isDeepMode = requestBody.analysisMode === "deep";

    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('is_premium, deep_analysis_count, deep_analysis_window_start, standard_analysis_count, standard_analysis_window_start')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error reading credits:', creditsError);
      throw new Error('Failed to check credits');
    }

    const isPremium = creditsData?.is_premium ?? false;
    
    const deepLimit = isPremium ? 2 : 0;
    const standardLimit = isPremium ? 6 : 2;

    if (isDeepMode) {
      if (!isPremium) {
        return new Response(
          JSON.stringify({ error: 'Deep analysis requires premium subscription' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const currentDeepCount = creditsData?.deep_analysis_count ?? 0;
      const deepWindowStart = creditsData?.deep_analysis_window_start;
      
      if (deepWindowStart) {
        const windowEndsAt = new Date(new Date(deepWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentDeepCount >= deepLimit) {
          console.log(`⛔ Deep analysis limit reached: ${currentDeepCount}/${deepLimit}`);
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
      const currentStandardCount = creditsData?.standard_analysis_count ?? 0;
      const standardWindowStart = creditsData?.standard_analysis_window_start;
      
      if (standardWindowStart) {
        const windowEndsAt = new Date(new Date(standardWindowStart).getTime() + 24 * 60 * 60 * 1000);
        if (new Date() < windowEndsAt && currentStandardCount >= standardLimit) {
          console.log(`⛔ Standard analysis limit reached: ${currentStandardCount}/${standardLimit}`);
          return new Response(
            JSON.stringify({ 
              error: `Analysis limit reached (${currentStandardCount}/${standardLimit}). Next available at ${windowEndsAt.toISOString()}.`
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      console.log(`✅ Standard analysis allowed. Current count: ${currentStandardCount}/${standardLimit}`);
    }

    const validated = inputSchema.parse(requestBody);
    console.log(`Analysis mode: ${validated.analysisMode || 'standard'}, Platform: ${validated.platform}`);

    const systemPrompt = isDeepMode
      ? `You are an expert Digital Marketing Strategist specializing in paid advertising campaigns across multiple platforms.

Your task is to provide a COMPREHENSIVE advertising strategy with actionable, data-driven recommendations.

ANALYSIS REQUIREMENTS:
- Provide 4-6 highly specific ad campaign recommendations
- Include detailed targeting strategies with demographic and psychographic insights
- Suggest multiple ad formats and creative approaches
- Provide realistic performance estimates (CPM, CTR, conversion rates)
- Include A/B testing frameworks
- Recommend specific audience segments to target
- Analyze competitor strategies when provided
- Suggest detailed budget allocation across campaigns
- Include KPI tracking metrics and optimization strategies

FORMAT YOUR RESPONSE AS JSON:
{
  "recommendations": [
    {
      "platform": "Platform name",
      "adFormat": "Specific ad type (e.g., YouTube TrueView, Instagram Stories, Google Search Ads)",
      "targetingStrategy": "Detailed targeting approach (demographics, interests, behaviors, lookalikes)",
      "adCopyExample": "Compelling ad copy example with headline, description, CTA",
      "estimatedCPM": "Realistic CPM range based on platform and targeting",
      "estimatedCTR": "Expected click-through rate percentage",
      "budgetAllocation": "Recommended percentage of total budget",
      "detailedStrategy": ["Step-by-step implementation roadmap with timelines"],
      "abTestingIdeas": ["Specific elements to test (e.g., headlines, images, CTAs, audiences)"],
      "audienceSegments": ["Specific audience segments to create and target"],
      "competitorInsights": ["Analysis of competitor strategies and gaps to exploit"],
      "kpiMetrics": ["Key performance indicators to track"],
      "optimizationTips": ["Ongoing optimization recommendations based on performance data"]
    }
  ],
  "generalAdvice": "Strategic overview covering campaign structure, budget pacing, creative testing framework, attribution modeling, and platform-specific best practices. Include timeline for launch and optimization phases."
}

IMPORTANT:
- All text must be in English
- Be specific and actionable
- Include realistic performance benchmarks for the industry
- Provide creative direction and messaging guidance
- Consider the user's budget constraints
- Suggest scalable strategies`
      : `You are a Digital Marketing Advisor specializing in paid advertising.

Provide 3-4 practical advertising recommendations for the specified platform.

FORMAT YOUR RESPONSE AS JSON:
{
  "recommendations": [
    {
      "platform": "Platform name",
      "adFormat": "Ad type (e.g., Video Ads, Carousel Ads, Display Ads)",
      "targetingStrategy": "Basic targeting approach",
      "adCopyExample": "Simple ad copy example",
      "estimatedCPM": "CPM range",
      "estimatedCTR": "Expected CTR",
      "budgetAllocation": "Budget percentage"
    }
  ],
  "generalAdvice": "Brief overview of campaign strategy and best practices for this platform."
}

IMPORTANT: All text must be in English and be concise but actionable.`;

    const userPrompt = isDeepMode
      ? `Platform: ${validated.platform}
Campaign Type: ${validated.campaignType}
Budget Range: ${validated.budgetRange}
Product Details: ${validated.productDetails}
Target Audience: ${validated.targetAudience || 'Not specified'}
${validated.productDescription ? `Product Description: ${validated.productDescription}` : ''}

Provide a comprehensive, data-driven advertising strategy with specific recommendations.`
      : `Platform: ${validated.platform}
Campaign Type: ${validated.campaignType}
Budget Range: ${validated.budgetRange}
Product Details: ${validated.productDetails}

Provide practical advertising recommendations for this campaign.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: isDeepMode ? 4000 : 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    let parsedResult;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || [null, aiContent];
      const jsonStr = jsonMatch[1] || aiContent;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI JSON:', parseError);
      throw new Error('Invalid AI response format');
    }

    const { error: insertError } = await supabase
      .from('ads_advisor_history')
      .insert({
        user_id: user.id,
        platform: validated.platform,
        campaign_type: validated.campaignType,
        budget_range: validated.budgetRange,
        product_details: validated.productDetails,
        target_audience: validated.targetAudience,
        product_description: validated.productDescription,
        analysis_mode: validated.analysisMode || 'standard',
        result: parsedResult
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save analysis');
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Ads analysis completed in ${duration}ms`);

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ads-advisor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
