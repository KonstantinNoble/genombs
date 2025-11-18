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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get and parse the event directly (no signature verification)
    const rawBody = await req.text();
    const event: FreemiusWebhookEvent = JSON.parse(rawBody);
    console.log('Received Freemius webhook event:', event.type, 'ID:', event.id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if event was already processed (prevent replay attacks)
    const { data: existingEvent } = await supabase
      .from('processed_webhook_events')
      .select('event_id')
      .eq('event_id', event.id)
      .maybeSingle();

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, returning success (idempotent)`);
      return new Response(
        JSON.stringify({ message: 'Event already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
      
      // Mark event as processed for pending users too
      await supabase
        .from('processed_webhook_events')
        .insert({
          event_id: event.id,
          event_type: event.type,
        });

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
        // Don't deactivate immediately - update auto_renew status
        console.log('Subscription cancelled, updating auto-renewal status:', profile.id);
        
        const updateCancelData: any = {
          auto_renew: false,
          next_payment_date: null
        };
        
        let subscriptionEndDate: Date | null = null;
        
        // Store subscription end date with fallback calculation
        if (event.objects.subscription?.ends) {
          subscriptionEndDate = new Date(event.objects.subscription.ends);
          updateCancelData.subscription_end_date = subscriptionEndDate.toISOString();
          console.log('Storing subscription end date from webhook:', updateCancelData.subscription_end_date);
        } else if (event.objects.subscription?.created) {
          // Fallback: Calculate end date based on creation date + 30 days (monthly assumption)
          const createdDate = new Date(event.objects.subscription.created);
          createdDate.setDate(createdDate.getDate() + 30);
          subscriptionEndDate = createdDate;
          updateCancelData.subscription_end_date = subscriptionEndDate.toISOString();
          console.log('Calculated fallback subscription end date (created +30 days):', updateCancelData.subscription_end_date);
        } else {
          console.warn('No subscription end date available and no creation date for fallback calculation');
        }
        
        // ✅ WICHTIG: Setze is_premium auf true, wenn Abo noch läuft
        if (subscriptionEndDate && subscriptionEndDate > new Date()) {
          updateCancelData.is_premium = true;
          console.log('Subscription still valid until:', subscriptionEndDate.toISOString(), '- keeping premium status');
        } else {
          updateCancelData.is_premium = false;
          console.log('Subscription already expired or no end date available - removing premium status');
        }
        
        const { error: cancelError } = await supabase
          .from('user_credits')
          .update(updateCancelData)
          .eq('user_id', profile.id);
        
        if (cancelError) {
          console.error('Error updating cancellation status:', cancelError);
        }

        // Mark event as processed
        await supabase
          .from('processed_webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
          });

        return new Response(
          JSON.stringify({ message: 'Auto-renewal deactivated, subscription will expire naturally' }),
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
      
      // Add subscription dates
      if (event.objects.subscription?.ends) {
        updateData.subscription_end_date = new Date(event.objects.subscription.ends).toISOString();
      }
      if (event.objects.subscription?.next_payment_date) {
        updateData.next_payment_date = new Date(event.objects.subscription.next_payment_date).toISOString();
      }
      
      // Set auto_renew based on event type
      // For subscription creation/activation/renewal, auto_renew should be true
      if (event.type === 'subscription.created' || 
          event.type === 'subscription.activated' || 
          event.type === 'subscription.renewed') {
        updateData.auto_renew = true;
      }
      
      // Set premium_since only if it's a new premium activation
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('premium_since')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (!existingCredits?.premium_since) {
        updateData.premium_since = premiumSince;
      }
    } else {
      // When deactivating, clear subscription dates
      updateData.subscription_end_date = null;
      updateData.next_payment_date = null;
      updateData.auto_renew = false;
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

    // Mark event as processed
    const { error: processedError } = await supabase
      .from('processed_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    if (processedError) {
      console.error('Error marking event as processed:', processedError);
      // Don't fail the request - the update was successful
    }

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
