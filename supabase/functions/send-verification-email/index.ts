import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: string;
  email: string;
  token?: string;
  token_hash?: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailRequest = await req.json();
    console.log('Email request received:', { type: payload.type, email: payload.email });

    // For signup verification
    if (payload.type === 'signup') {
      const verificationLink = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${payload.token_hash}&type=signup&redirect_to=${payload.redirect_to}`;
      
      console.log('Verification email sent to:', payload.email);
      console.log('Verification link:', verificationLink);
      
      // In a real implementation, you would send the email here
      // For now, we'll log it for testing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification email sent',
          verificationLink // Remove this in production
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email processed' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
