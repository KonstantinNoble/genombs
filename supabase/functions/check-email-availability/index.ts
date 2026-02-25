import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.76.1";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit: 3 registration attempts per hour per IP
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

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

    // === IP-based Rate Limiting ===
    // Extract client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('x-real-ip') 
      || 'unknown';

    // Hash the IP for privacy (GDPR compliance)
    const ipData = encoder.encode(clientIP);
    const ipHashBuffer = await crypto.subtle.digest('SHA-256', ipData);
    const ipHashArray = Array.from(new Uint8Array(ipHashBuffer));
    const ipHash = ipHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Log attempt first (before checking the limit)
    // This prevents race conditions with parallel requests
    const { error: insertError } = await supabase
      .from('registration_attempts')
      .insert({ ip_hash: ipHash, email_hash: emailHash });

    if (insertError) {
      console.error('Failed to log registration attempt:', insertError);
      // Continue anyway - don't block registration
    }

    // Then: Check current count (including the just-inserted entry)
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: countError } = await supabase
      .from('registration_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('attempted_at', oneHourAgo);

    if (countError) {
      console.error('Rate limit check failed:', countError);
      // Fail-open on database error
    } else if (count !== null && count > RATE_LIMIT_MAX) {
      // More than 3 attempts (including current): Rate limit error
      console.log(`Rate limit exceeded for IP hash: ${ipHash.substring(0, 8)}... (${count} attempts)`);
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: "RATE_LIMITED",
          message: "Too many registration attempts. Please try again in 1 hour."
        }),
        // Status 200 so supabase.functions.invoke() returns it as data, not error
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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
        // Continue to check auth.users
      } else {
        // Email is blocked - calculate remaining hours (always positive)
        const hoursRemaining = Math.max(1, Math.ceil(24 - hoursSinceDeletion));

        return new Response(
          JSON.stringify({ 
            available: false, 
            reason: "RECENTLY_DELETED",
            message: `This email address cannot be used. Please try again in ${hoursRemaining} hours.`
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Check if email exists in auth.users (O(1) indexed lookup via DB function)
    const { data: authUsers, error: queryError } = await supabase.rpc(
      'get_auth_user_by_email',
      { lookup_email: validatedEmail.toLowerCase().trim() }
    );

    if (queryError || !authUsers || authUsers.length === 0) {
      return new Response(
        JSON.stringify({ available: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const existingUser = {
      id: authUsers[0].id,
      email: authUsers[0].email,
      app_metadata: authUsers[0].raw_app_meta_data || {}
    };

    // User exists - check what providers they use
    const providers = existingUser.app_metadata?.providers || [];
    const hasEmailProvider = providers.includes('email');

    if (providers.includes('google') && !hasEmailProvider) {
      // User only has Google OAuth
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: "EXISTING_GOOGLE_ACCOUNT",
          message: "An account with this email already exists. Please sign in with Google."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (hasEmailProvider) {
      // User has email/password account
      return new Response(
        JSON.stringify({ 
          available: false, 
          reason: "EXISTING_EMAIL_ACCOUNT",
          message: "An account with this email already exists. Please sign in instead."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // User has some other OAuth provider
    const primaryProvider = providers[0] || 'social';
    return new Response(
      JSON.stringify({ 
        available: false, 
        reason: "EXISTING_OAUTH_ACCOUNT",
        provider: primaryProvider,
        message: `An account with this email already exists. Please sign in with ${primaryProvider}.`
      }),
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