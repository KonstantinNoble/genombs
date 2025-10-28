import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ available: false, reason: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash email using SHA-256
    const encoder = new TextEncoder();
    const emailData = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Configuration error");
      // Fail-open: Allow registration if service is misconfigured
      return new Response(
        JSON.stringify({ available: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Check if email hash exists in deleted_accounts
    const { data, error } = await supabase
      .from('deleted_accounts')
      .select('id, deleted_at')
      .eq('email_hash', emailHash)
      .maybeSingle();

    if (error) {
      console.error('Database check failed:', error);
      // Fail-open: Allow registration on database error
      return new Response(
        JSON.stringify({ available: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (data) {
      // Hash found - email is blocked
      const daysRemaining = Math.ceil(
        (30 - (Date.now() - new Date(data.deleted_at).getTime()) / (1000 * 60 * 60 * 24))
      );

      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: `Diese Email-Adresse kann nicht verwendet werden. Bitte versuchen Sie es in ${daysRemaining} Tagen erneut.`
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash not found - email is available
    return new Response(
      JSON.stringify({ available: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error('Function failed:', error);
    // Fail-open: Allow registration on unexpected error
    return new Response(
      JSON.stringify({ available: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
