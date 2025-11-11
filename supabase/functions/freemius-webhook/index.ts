import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

interface FreemiusWebhookEvent {
  type: string;
  id: string;
  created: string;
  objects: {
    user?: {
      id: string;
      email: string;
      first?: string;
      last?: string;
    };
    subscription?: {
      id: string;
      plan_id: string;
      created: string;
      next_payment_date?: string;
      ends?: string;
    };
    purchase?: {
      id: string;
      subscription_id?: string;
    };
  };
}

async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.error('No signature provided in webhook');
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('FREEMIUS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('FREEMIUS_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the event
    const event: FreemiusWebhookEvent = JSON.parse(rawBody);
    console.log('Received Freemius webhook event:', event.type, 'ID:', event.id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract user email from event
    const userEmail = event.objects.user?.email?.toLowerCase();
    if (!userEmail) {
      console.log(`Skipping event ${event.type} (ID: ${event.id}) - no user email provided`);
      return new Response(
        JSON.stringify({ message: 'Event skipped - no user email' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing webhook for email:', userEmail);

    // Find user by email in profiles table (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', userEmail)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      console.log('User not found in database, storing in pending_premium:', userEmail);
      
      // Determine premium status based on event type
      let isPremiumPending = false;
      let subscriptionIdPending: string | null = null;
      let customerIdPending: string | null = null;

      switch (event.type) {
        case 'purchase.completed':
        case 'subscription.created':
        case 'subscription.activated':
        case 'subscription.renewed':
          isPremiumPending = true;
          subscriptionIdPending = event.objects.subscription?.id || event.objects.purchase?.subscription_id || null;
          customerIdPending = event.objects.user?.id || null;
          break;
        default:
          // For other events (cancellation, expiry), don't create pending entry
          return new Response(
            JSON.stringify({ message: 'Event type not applicable for pending user' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }

      if (!isPremiumPending || !subscriptionIdPending || !customerIdPending) {
        console.error('Missing required data for pending premium');
        return new Response(
          JSON.stringify({ error: 'Missing subscription data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store in pending_premium table
      const { error: pendingError } = await supabase
        .from('pending_premium')
        .upsert({
          freemius_customer_id: customerIdPending,
          freemius_subscription_id: subscriptionIdPending,
          email: userEmail,
          is_premium: true,
        }, { 
          onConflict: 'freemius_customer_id',
          ignoreDuplicates: false 
        });

      if (pendingError) {
        console.error('Error storing pending premium:', pendingError);
        return new Response(
          JSON.stringify({ error: 'Failed to store pending premium' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Successfully stored pending premium for:', userEmail);
      return new Response(
        JSON.stringify({ message: 'Premium stored in pending, will activate on first login' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different webhook events
    let isPremium = false;
    let premiumSince: string | null = null;
    let subscriptionId: string | null = null;
    let customerId: string | null = null;

    switch (event.type) {
      case 'purchase.completed':
      case 'subscription.created':
      case 'subscription.activated':
      case 'subscription.renewed':
        // Activate premium
        isPremium = true;
        premiumSince = new Date().toISOString();
        subscriptionId = event.objects.subscription?.id || event.objects.purchase?.subscription_id || null;
        customerId = event.objects.user?.id || null;
        console.log('Activating premium for user:', profile.id);
        break;

      case 'subscription.cancelled':
        // Don't deactivate immediately - let it run until expiry
        console.log('Subscription cancelled but not deactivating yet:', profile.id);
        return new Response(
          JSON.stringify({ message: 'Subscription cancelled, will expire naturally' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'subscription.expired':
        // Deactivate premium
        isPremium = false;
        console.log('Deactivating premium for user:', profile.id);
        break;

      case 'refund.completed':
        // Immediate deactivation on refund
        isPremium = false;
        console.log('Refund processed, deactivating premium for user:', profile.id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
        return new Response(
          JSON.stringify({ message: 'Event type not processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Update user_credits table
    const updateData: any = {
      user_id: profile.id,
      is_premium: isPremium,
    };

    if (isPremium) {
      // Only update these fields when activating premium
      if (subscriptionId) updateData.freemius_subscription_id = subscriptionId;
      if (customerId) updateData.freemius_customer_id = customerId;
      
      // Set premium_since only if it's a new premium activation
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('premium_since')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!existingCredits?.premium_since) {
        updateData.premium_since = premiumSince;
      }
    }

    const { error: updateError } = await supabase
      .from('user_credits')
      .upsert(updateData, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully updated premium status for user:', profile.id);

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        user_id: profile.id,
        is_premium: isPremium
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
