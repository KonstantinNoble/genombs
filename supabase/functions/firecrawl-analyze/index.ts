import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebsiteInsights {
  businessType: string;
  offerings: string[];
  targetAudience: string;
  currentChannels: string[];
  problems: string[];
  improvements: string[];
  rawContent: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Analyzing website:', formattedUrl);

    // Scrape the website with Firecrawl
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = data.data?.markdown || '';
    const metadata = data.data?.metadata || {};
    
    if (!markdown || markdown.length < 100) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not extract enough content from this website. Please check if the URL is correct.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Scraped ${markdown.length} characters from ${formattedUrl}`);

    // Use Lovable AI to analyze the website content
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      // Return raw content without AI analysis
      return new Response(
        JSON.stringify({ 
          success: true, 
          insights: {
            businessType: 'Unknown',
            offerings: [],
            targetAudience: 'Unknown',
            currentChannels: [],
            problems: [],
            improvements: [],
            rawContent: markdown.substring(0, 3000)
          },
          metadata 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze with AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a business analyst. Analyze the website content and extract insights.
Return ONLY a valid JSON object with no markdown, no explanation:
{
  "businessType": "Brief description of what type of business this is",
  "offerings": ["Product/Service 1", "Product/Service 2"],
  "targetAudience": "Who the business is targeting",
  "currentChannels": ["Marketing channels visible on site, e.g. Social links, Newsletter, Blog"],
  "problems": ["Issue 1: specific problem with the website", "Issue 2: another problem"],
  "improvements": ["Improvement 1: specific actionable suggestion", "Improvement 2: another suggestion"]
}

Focus on:
- What the business sells/offers
- Who they're targeting
- Visible marketing channels (social links, newsletter, blog, etc.)
- Website problems: slow loading, no clear CTA, poor copy, missing trust elements
- Specific improvements with actionable suggestions`
          },
          {
            role: 'user',
            content: `Analyze this website content:\n\nURL: ${formattedUrl}\nTitle: ${metadata.title || 'Unknown'}\nDescription: ${metadata.description || 'None'}\n\nContent:\n${markdown.substring(0, 8000)}`
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI analysis error:', await aiResponse.text());
      return new Response(
        JSON.stringify({ 
          success: true, 
          insights: {
            businessType: metadata.title || 'Unknown',
            offerings: [],
            targetAudience: 'Unknown',
            currentChannels: [],
            problems: [],
            improvements: [],
            rawContent: markdown.substring(0, 3000)
          },
          metadata 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse AI response
    let insights: WebsiteInsights;
    try {
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      insights = JSON.parse(cleanedContent.trim());
      insights.rawContent = markdown.substring(0, 2000);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content.substring(0, 500));
      insights = {
        businessType: metadata.title || 'Unknown',
        offerings: [],
        targetAudience: 'Unknown',
        currentChannels: [],
        problems: [],
        improvements: [],
        rawContent: markdown.substring(0, 2000)
      };
    }

    console.log('Website analysis complete:', {
      businessType: insights.businessType,
      offeringsCount: insights.offerings?.length || 0,
      problemsCount: insights.problems?.length || 0
    });

    return new Response(
      JSON.stringify({ success: true, insights, metadata }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing website:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze website';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
