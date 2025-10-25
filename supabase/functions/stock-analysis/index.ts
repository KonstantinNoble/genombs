import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client (fallback to ANON if PUBLISHABLE not present)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from JWT explicitly
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error or no user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user can perform analysis (24h limit)
    const { data: canAnalyze, error: limitError } = await supabaseClient.rpc('check_and_update_analysis_limit', {
      p_user_id: user.id
    });

    if (limitError) {
      console.error('Error checking analysis limit:', limitError);
      return new Response(
        JSON.stringify({ error: 'Failed to check analysis limit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!canAnalyze) {
      return new Response(
        JSON.stringify({ error: 'You can only perform one analysis per day. Please try again in 24 hours.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { riskTolerance, timeHorizon, assetClass, marketEvents } = await req.json();

    console.log('Stock analysis request:', { riskTolerance, timeHorizon, assetClass, marketEvents });

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Validate inputs
    if (!riskTolerance || !timeHorizon || !assetClass) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: riskTolerance, timeHorizon, or assetClass' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a financial information assistant providing general market information for educational purposes only.

CRITICAL DISCLAIMERS - You MUST communicate these clearly:
- This is NOT financial advice, investment advice, or personal financial consultation
- This is general market information for educational purposes only
- You do NOT provide personalized recommendations or specific buy/sell instructions
- Users should consult with licensed financial advisors before making investment decisions
- Past performance does not guarantee future results
- All investments carry risk, including potential loss of principal

Based on the user's stated preferences, provide 3-5 stock examples that generally align with their criteria as educational information:

For each stock provide:
- Company name and ticker symbol
- Sector/Industry
- General characteristics (e.g., growth-oriented, defensive, dividend-focused, etc.)
- Brief factual information about why it might align with the stated criteria (1-2 sentences)

Important Guidelines:
- Use neutral, educational language
- Present factual market information without directive recommendations
- Emphasize this is for informational purposes only
- Consider the user's stated risk tolerance and time horizon as filtering criteria
- Take current market context into account
- Provide balanced examples across different sectors when appropriate`;

    const userPrompt = `Provide general market information and educational stock examples based on the following stated preferences:
- Risk Tolerance: ${riskTolerance}
- Time Horizon: ${timeHorizon}
- Asset Class: ${assetClass}
- Market Context: ${marketEvents || 'Current market conditions'}

Please provide 3-5 stock examples for educational purposes that generally align with these stated preferences. Remember: This is informational only, not financial advice.`;

    console.log('Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_stock_suggestions',
              description: 'Provide educational stock examples based on stated user preferences (not financial advice)',
              parameters: {
                type: 'object',
                properties: {
                  stocks: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Company name' },
                        ticker: { type: 'string', description: 'Stock ticker symbol' },
                        sector: { type: 'string', description: 'Industry sector' },
                        assessment: { 
                          type: 'string', 
                          description: 'General characteristics of the stock',
                          enum: ['growth-oriented', 'defensive', 'dividend-strong', 'balanced', 'speculative']
                        },
                        rationale: { type: 'string', description: 'Factual information about why this aligns with stated criteria (1-2 sentences)' }
                      },
                      required: ['name', 'ticker', 'sector', 'assessment', 'rationale'],
                      additionalProperties: false
                    },
                    minItems: 3,
                    maxItems: 5
                  },
                  generalAnalysis: { 
                    type: 'string', 
                    description: 'General market information and educational context (2-3 sentences). Must emphasize this is for informational purposes only, not financial advice.' 
                  }
                },
                required: ['stocks', 'generalAnalysis'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_stock_suggestions' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted for this workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate analysis. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in response');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in stock-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
