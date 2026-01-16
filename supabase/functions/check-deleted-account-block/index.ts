import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * This function ONLY checks if an email is blocked due to recent account deletion (24h).
 * It does NOT:
 * - Log registration attempts (no rate limiting)
 * - Check if user exists in auth.users
 * - Do any other validation
 * 
 * Use this in the auth callback flow for new users.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // Basic email validation
    const emailSchema = z.string().email().max(255);
    
    let validatedEmail: string;
    try {
      validatedEmail = emailSchema.parse(email);
    } catch (error) {
      console.error("Invalid email format:", email);
      // Not a valid email - can't be blocked
      return new Response(
        JSON.stringify({ blocked: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
      console.error("Configuration error: missing environment variables");
      // Fail-open: Allow if service is misconfigured
      return new Response(
        JSON.stringify({ blocked: false }),
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
      // Fail-open: Allow on database error
      return new Response(
        JSON.stringify({ blocked: false }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (data) {
      // Hash found - check if it's actually still within 24h period
      const hoursSinceDeletion = (Date.now() - new Date(data.deleted_at).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceDeletion < 24) {
        // Email is blocked - calculate remaining hours
        const hoursRemaining = Math.max(1, Math.ceil(24 - hoursSinceDeletion));

        console.log(`Email blocked: ${emailHash.substring(0, 8)}... (${hoursRemaining}h remaining)`);

        return new Response(
          JSON.stringify({ 
            blocked: true, 
            hoursRemaining,
            message: `This email address cannot be used for another ${hoursRemaining} hours due to a recent account deletion.`
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Older than 24h - not blocked (cron will clean up)
      console.log(`Email hash found but expired: ${emailHash.substring(0, 8)}...`);
    }

    // Not blocked
    return new Response(
      JSON.stringify({ blocked: false }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error('Function failed:', error);
    // Fail-open: Allow on unexpected error
    return new Response(
      JSON.stringify({ blocked: false }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
