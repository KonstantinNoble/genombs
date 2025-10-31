import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

    // Server-side email validation
    const emailSchema = z.string().email().max(255);
    
    let validatedEmail: string;
    try {
      validatedEmail = emailSchema.parse(email);
    } catch (error) {
      return new Response(
        JSON.stringify({ available: false, reason: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Hash email using SHA-256
    const encoder = new TextEncoder();
    const emailData = encoder.encode(validatedEmail.toLowerCase().trim());
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
      // Hash found - check if it's actually still within 24h period
      const hoursSinceDeletion = (Date.now() - new Date(data.deleted_at).getTime()) / (1000 * 60 * 60);
      
      // If older than 24h, treat as available (cron job will clean up soon)
      if (hoursSinceDeletion >= 24) {
        return new Response(
          JSON.stringify({ available: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Email is blocked - calculate remaining hours (always positive)
      const hoursRemaining = Math.max(1, Math.ceil(24 - hoursSinceDeletion));

      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: `This email address cannot be used. Please try again in ${hoursRemaining} hours.`
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
