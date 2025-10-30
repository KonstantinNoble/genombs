import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const resendAudienceId = Deno.env.get('RESEND_AUDIENCE_ID');

interface SyncRequest {
  email: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Sync user to Resend triggered');

    // Check if Resend Audience ID is configured
    if (!resendAudienceId) {
      console.error('❌ RESEND_AUDIENCE_ID is not configured');
      return new Response(
        JSON.stringify({ error: 'Resend Audience ID not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, user_id }: SyncRequest = await req.json();

    if (!email) {
      console.error('❌ No email provided');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📧 Adding email to Resend Audience: ${email}`);

    // Add contact to Resend Audience
    const response = await resend.contacts.create({
      email: email,
      audienceId: resendAudienceId,
    });

    console.log('✅ Contact added to Resend:', response);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User synced to Resend Audience',
        contact_id: response.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error syncing user to Resend:', error);
    
    // Handle duplicate contact error gracefully
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('ℹ️ Contact already exists in Resend Audience');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Contact already exists in audience' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
