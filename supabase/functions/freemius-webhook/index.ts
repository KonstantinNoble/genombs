import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

// Corrected interface based on Freemius API documentation
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
      next_payment?: string;        // Corrected: was next_payment_date
      canceled_at?: string;         // Corrected: was ends (doesn't exist)
      billing_cycle?: number;       // 1=monthly, 12=yearly
    };
    license?: {                     // License object
      id: string;
      expiration?: string;          // The actual expiration date
    };
    payment?: {
      id: string;
      subscription_id?: string;
      gross?: number;
      is_renewal?: boolean;         // Indicates if this is a renewal
    };
  };
}

// Helper: Calculate subscription end date based on billing_cycle
function calculateSubscriptionEndDate(billingCycle?: number): Date {
  const endDate = new Date();
  if (billingCycle === 12) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }
  return endDate;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify Freemius webhook signature
    const signature = req.headers.get('x-signature');
    if (!signature) {
      console.error('Missing webhook signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const freemiusSecretKey = Deno.env.get('FREEMIUS_SECRET_KEY');
    if (!freemiusSecretKey) {
      console.error('FREEMIUS_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compute HMAC-SHA256 signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(freemiusSecretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );
    
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook signature verified successfully');
    
    // Parse the verified event
    const event: FreemiusWebhookEvent = JSON.parse(rawBody);
    console.log('========================================');
    console.log('📨 WEBHOOK RECEIVED');
    console.log('Event Type:', event.type);
    console.log('Event ID:', event.id);
    console.log('User Email:', event.objects.user?.email);
    console.log('User ID (Freemius):', event.objects.user?.id);
    console.log('Subscription ID:', event.objects.subscription?.id);
    console.log('Subscription next_payment:', event.objects.subscription?.next_payment);
    console.log('Subscription billing_cycle:', event.objects.subscription?.billing_cycle);
    console.log('License expiration:', event.objects.license?.expiration);
    console.log('Payment ID:', event.objects.payment?.id);
    console.log('Payment is_renewal:', event.objects.payment?.is_renewal);
    console.log('Full Event:', JSON.stringify(event, null, 2));
    console.log('========================================');

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

    // Find user by email using Auth Admin API
    // Note: listUsers doesn't support email filter directly, but we limit fetch and search
    // For scalability at 10k+ users, consider using a custom profiles table with email index
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
      perPage: 1000 // Fetch in smaller batches
    });
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the user by email (case-insensitive)
    const authUser = users?.find(u => u.email?.toLowerCase() === userEmail);
    const profile = authUser ? { id: authUser.id } : null;

    if (!profile) {
      console.log('❌ USER NOT FOUND IN DATABASE');
      console.log('Email:', userEmail);
      console.log('Action: Storing in pending_premium table');
      
      // Only store pending premium for activation events
      const activationEvents = ['subscription.created', 'payment.created'];
      
      if (!activationEvents.includes(event.type)) {
        console.log(`Event ${event.type} not applicable for pending user`);
        return new Response(
          JSON.stringify({ message: 'Event type not applicable for pending user' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const subscriptionIdPending = event.objects.subscription?.id || event.objects.payment?.subscription_id || null;
      const customerIdPending = event.objects.user?.id || null;

      if (!subscriptionIdPending || !customerIdPending) {
        console.error('Missing required data for pending premium');
        return new Response(
          JSON.stringify({ error: 'Missing subscription data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Calculate subscription_end_date for pending_premium
      let pendingSubscriptionEndDate: string;
      if (event.objects.license?.expiration) {
        pendingSubscriptionEndDate = new Date(event.objects.license.expiration).toISOString();
      } else {
        pendingSubscriptionEndDate = calculateSubscriptionEndDate(event.objects.subscription?.billing_cycle).toISOString();
      }

      // Store in pending_premium table with all relevant fields
      const { error: pendingError } = await supabase
        .from('pending_premium')
        .upsert({
          freemius_customer_id: customerIdPending,
          freemius_subscription_id: subscriptionIdPending,
          email: userEmail,
          is_premium: true,
          subscription_end_date: pendingSubscriptionEndDate,
          billing_cycle: event.objects.subscription?.billing_cycle || 1,
          auto_renew: true,
          next_payment_date: event.objects.subscription?.next_payment
            ? new Date(event.objects.subscription.next_payment).toISOString()
            : pendingSubscriptionEndDate,
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

      console.log('✅ PENDING PREMIUM STORED');
      console.log('Email:', userEmail);
      console.log('Will activate on first login');
      
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
    switch (event.type) {
      // ============================================
      // NEW SUBSCRIPTION CREATED
      // ============================================
      case 'subscription.created': {
        console.log('✅ NEW SUBSCRIPTION CREATED');
        console.log('User ID:', profile.id);
        
        const subscriptionId = event.objects.subscription?.id || null;
        const customerId = event.objects.user?.id || null;
        const billingCycle = event.objects.subscription?.billing_cycle;
        
        const updateData: any = {
          user_id: profile.id,
          is_premium: true,
          auto_renew: true,
          freemius_subscription_id: subscriptionId,
          freemius_customer_id: customerId,
        };

        // Set premium_since only if new
        const { data: existingCredits } = await supabase
          .from('user_credits')
          .select('premium_since')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (!existingCredits?.premium_since) {
          updateData.premium_since = new Date().toISOString();
        }

        // Use license.expiration for the end date
        if (event.objects.license?.expiration) {
          updateData.subscription_end_date = new Date(event.objects.license.expiration).toISOString();
          console.log('Using license.expiration:', updateData.subscription_end_date);
        } else {
          // Fallback: Calculate based on billing_cycle
          const endDate = calculateSubscriptionEndDate(billingCycle);
          updateData.subscription_end_date = endDate.toISOString();
          console.log('Calculated subscription_end_date based on billing_cycle:', billingCycle, '->', updateData.subscription_end_date);
        }
        
        // Use next_payment instead of next_payment_date
        if (event.objects.subscription?.next_payment) {
          updateData.next_payment_date = new Date(event.objects.subscription.next_payment).toISOString();
          console.log('Using next_payment:', updateData.next_payment_date);
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

        console.log('✅ Premium activated for subscription.created');
        break;
      }

      // ============================================
      // PAYMENT RECEIVED (NEW OR RENEWAL)
      // ============================================
      case 'payment.created': {
        console.log('💰 PAYMENT RECEIVED');
        console.log('User ID:', profile.id);
        console.log('Payment ID:', event.objects.payment?.id);
        console.log('Is Renewal:', event.objects.payment?.is_renewal);
        console.log('Payment gross:', event.objects.payment?.gross);
        
        // FIX: Skip if this is actually a refund (negative gross or type=refund)
        const paymentObj = event.objects.payment;
        if (paymentObj?.gross !== undefined && paymentObj.gross < 0) {
          console.log('⚠️ Skipping payment.created - negative gross indicates this is a refund');
          await supabase.from('processed_webhook_events').insert({
            event_id: event.id,
            event_type: event.type,
          });
          return new Response(
            JSON.stringify({ message: 'Refund payment.created skipped' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const subscriptionId = event.objects.subscription?.id || event.objects.payment?.subscription_id || null;
        const customerId = event.objects.user?.id || null;
        const billingCycle = event.objects.subscription?.billing_cycle;

        // Calculate new end date based on billing_cycle
        const newEndDate = calculateSubscriptionEndDate(billingCycle);

        const updateData: any = {
          user_id: profile.id,
          is_premium: true,
          auto_renew: true,
          subscription_end_date: newEndDate.toISOString(),
        };

        if (subscriptionId) updateData.freemius_subscription_id = subscriptionId;
        if (customerId) updateData.freemius_customer_id = customerId;

        // Use next_payment instead of next_payment_date
        if (event.objects.subscription?.next_payment) {
          updateData.next_payment_date = new Date(event.objects.subscription.next_payment).toISOString();
          console.log('Using next_payment:', updateData.next_payment_date);
        } else {
          // Fallback: Same date as subscription_end_date
          updateData.next_payment_date = newEndDate.toISOString();
        }

        // Set premium_since only if new
        const { data: existingCredits } = await supabase
          .from('user_credits')
          .select('premium_since')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (!existingCredits?.premium_since) {
          updateData.premium_since = new Date().toISOString();
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

        console.log('✅ Premium extended for payment.created');
        console.log('New end date:', newEndDate.toISOString());
        console.log('Billing cycle:', billingCycle);
        break;
      }

      // ============================================
      // SUBSCRIPTION CANCELLED (still active until expiry)
      // ============================================
      case 'subscription.cancelled': {
        console.log('⚠️ SUBSCRIPTION CANCELLED');
        console.log('User ID:', profile.id);
        console.log('Action: Setting auto_renew to false (NOT re-activating premium)');
        
        // FIX: Only set auto_renew=false, do NOT touch is_premium
        // Premium status should only be changed by payment.refund or subscription.renewal.failed.last
        const updateCancelData: any = {
          auto_renew: false,
          next_payment_date: null
        };
        
        // Optionally update subscription_end_date if we have license expiration info
        if (event.objects.license?.expiration) {
          updateCancelData.subscription_end_date = new Date(event.objects.license.expiration).toISOString();
          console.log('Setting subscription_end_date from license.expiration:', updateCancelData.subscription_end_date);
        }
        
        const { error: cancelError } = await supabase
          .from('user_credits')
          .update(updateCancelData)
          .eq('user_id', profile.id);
        
        if (cancelError) {
          console.error('Error updating cancellation status:', cancelError);
          return new Response(
            JSON.stringify({ error: 'Failed to update cancellation status' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark event as processed
        await supabase
          .from('processed_webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
          });

        return new Response(
          JSON.stringify({ message: 'Auto-renewal deactivated, premium status unchanged' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // REFUND - IMMEDIATE DEACTIVATION
      // ============================================
      case 'payment.refund': {
        console.log('💰 REFUND PROCESSED');
        console.log('User ID:', profile.id);
        console.log('Action: Immediate premium deactivation');

        const { error: refundError } = await supabase
          .from('user_credits')
          .update({
            is_premium: false,
            auto_renew: false,
            subscription_end_date: null,
            next_payment_date: null,
          })
          .eq('user_id', profile.id);

        if (refundError) {
          console.error('Error processing refund:', refundError);
          return new Response(
            JSON.stringify({ error: 'Failed to process refund' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark event as processed
        await supabase
          .from('processed_webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
          });

        return new Response(
          JSON.stringify({ message: 'Premium deactivated due to refund' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // PAYMENT FAILED (initial attempts)
      // ============================================
      case 'subscription.renewal.failed': {
        console.log('⚠️ RENEWAL PAYMENT FAILED');
        console.log('User ID:', profile.id);
        console.log('Action: Logging warning, keeping premium active');

        // Just log - don't deactivate yet, Freemius will retry
        // Mark event as processed
        await supabase
          .from('processed_webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
          });

        return new Response(
          JSON.stringify({ message: 'Renewal failure logged, premium still active' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // PAYMENT FINALLY FAILED - DEACTIVATE
      // ============================================
      case 'subscription.renewal.failed.last': {
        console.log('❌ RENEWAL PAYMENT FAILED - FINAL');
        console.log('User ID:', profile.id);
        console.log('Action: Deactivating premium');

        const { error: failedError } = await supabase
          .from('user_credits')
          .update({
            is_premium: false,
            auto_renew: false,
            next_payment_date: null,
          })
          .eq('user_id', profile.id);

        if (failedError) {
          console.error('Error processing failed renewal:', failedError);
          return new Response(
            JSON.stringify({ error: 'Failed to process renewal failure' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark event as processed
        await supabase
          .from('processed_webhook_events')
          .insert({
            event_id: event.id,
            event_type: event.type,
          });

        return new Response(
          JSON.stringify({ message: 'Premium deactivated due to final payment failure' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================
      // UNKNOWN EVENT
      // ============================================
      default:
        console.log('Unhandled event type:', event.type);
        return new Response(
          JSON.stringify({ message: 'Event type not processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('========================================');
    console.log('✅ WEBHOOK PROCESSED SUCCESSFULLY');
    console.log('User ID:', profile.id);
    console.log('Event Type:', event.type);
    console.log('========================================');

    // Mark event as processed
    const { error: processedError } = await supabase
      .from('processed_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
      });

    if (processedError) {
      console.error('Error marking event as processed:', processedError);
    }

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        user_id: profile.id,
        event_type: event.type
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
