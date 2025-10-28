import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IdeaRecommendation {
  name: string;
  category: "product" | "service" | "saas" | "marketplace" | "content" | "consulting" | "ecommerce";
  viability: "quick-launch" | "medium-term" | "long-term";
  estimatedInvestment: string;
  rationale: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: canAnalyze, error: limitError } = await supabaseClient
      .rpc('check_and_update_analysis_limit', { p_user_id: user.id });

    if (limitError) {
      console.error('Error checking limit:', limitError);
      throw new Error('Failed to check analysis limit');
    }

    if (!canAnalyze) {
      return new Response(
        JSON.stringify({ error: 'Daily limit reached. You can request new recommendations once every 24 hours.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, teamSize, budgetRange, businessContext } = await req.json();

    if (!industry || !teamSize || !budgetRange || !businessContext) {
      throw new Error('Missing required fields');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a business innovation advisor specializing in generating creative and viable business ideas. 
Your task is to provide 5-7 specific business idea recommendations based on the user's context.

For each idea, provide:
- name: A clear, compelling name for the business idea
- category: Choose from: product, service, saas, marketplace, content, consulting, ecommerce
- viability: Choose from: quick-launch (can start in 1-3 months), medium-term (3-12 months), long-term (1+ years)
- estimatedInvestment: Estimated startup capital needed (e.g., "$500-$2,000", "$5,000-$20,000", "$50,000+")
- rationale: 2-3 sentences explaining why this idea fits their context and market opportunity

Also provide general strategic advice about the current market landscape and trends relevant to their industry.

Focus on:
- Realistic and actionable ideas based on their budget and team size
- Current market trends and opportunities
- Ideas that leverage their industry expertise
- Mix of different viability timeframes
- Specific rather than generic suggestions

Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "name": "Idea name",
      "category": "category",
      "viability": "viability",
      "estimatedInvestment": "investment",
      "rationale": "rationale"
    }
  ],
  "generalAdvice": "Strategic overview and market insights"
}`;

    const userPrompt = `Industry: ${industry}
Team Size: ${teamSize}
Available Budget: ${budgetRange}
Business Context: ${businessContext}

Generate 5-7 innovative business ideas tailored to this context.`;

    console.log('Calling Lovable AI for business ideas...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

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
    console.log('AI response received');
    
    const content = aiData.choices[0].message.content;
    let result;
    
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    const { error: insertError } = await supabaseClient
      .from('business_ideas_history')
      .insert({
        user_id: user.id,
        industry,
        team_size: teamSize,
        budget_range: budgetRange,
        business_context: businessContext,
        result
      });

    if (insertError) {
      console.error('Error saving to history:', insertError);
    }

    return new Response(
      JSON.stringify(result),
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