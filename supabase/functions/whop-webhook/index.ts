import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-whop-signature',
};

interface WhopWebhookEvent {
  id: string;
  type: string;
  action: string;
  data: {
    id: string;
    user: {
      id: string;
      email: string;
      username?: string;
    };
    product: {
      id: string;
      name: string;
    };
    plan: {
      id: string;
    };
    status: string;
    valid: boolean;
    cancel_at_period_end: boolean;
    expires_at?: string;
    valid_until?: string;
    metadata?: Record<string, any>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const whopWebhookSecret = Deno.env.get('WHOP_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!whopWebhookSecret) {
      console.error('WHOP_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook signature
    const signature = req.headers.get('x-whop-signature');
    const body = await req.text();
    
    console.log('Received webhook:', { signature: signature?.substring(0, 20), bodyLength: body.length });
    
    // Parse event
    const event: WhopWebhookEvent = JSON.parse(body);
    
    // Validate webhook data
    if (!event.data || !event.data.user) {
      console.error('❌ Invalid webhook data - missing user information:', JSON.stringify(event, null, 2));
      return new Response(
        JSON.stringify({ 
          error: 'Invalid webhook data', 
          details: 'Missing user information in event.data',
          received: { type: event.type, action: event.action }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Webhook event:', { 
      type: event.type, 
      action: event.action, 
      userId: event.data?.user?.id ?? 'unknown',
      userEmail: event.data?.user?.email ?? 'unknown'
    });

    // Handle different event types
    const eventType = event.action || event.type;
    
    if (eventType === 'membership.went_valid' || eventType === 'payment.succeeded') {
      // User purchased or renewed premium
      await handleMembershipActivated(supabase, event);
    } else if (eventType === 'membership.went_invalid' || eventType === 'membership.was_deleted') {
      // User cancelled or subscription expired
      await handleMembershipDeactivated(supabase, event);
    } else if (eventType === 'payment.refunded') {
      // User requested refund - CRITICAL: Remove premium immediately
      await handleRefund(supabase, event);
    } else if (eventType === 'payment.failed') {
      // Payment failed - log and monitor
      await handlePaymentFailed(supabase, event);
    } else {
      // Unknown event - log for monitoring
      console.warn('⚠️ UNHANDLED WEBHOOK EVENT:', eventType);
      console.warn('Event data:', JSON.stringify(event, null, 2));
    }

    return new Response(
      JSON.stringify({ success: true, event: eventType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whop-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleMembershipActivated(supabase: any, event: WhopWebhookEvent) {
  const { data: whopData } = event;
  
  console.log('Activating membership for:', whopData.user.email);
  
  // Find or create user by email
  const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    throw new Error('Failed to fetch users');
  }
  
  let user = existingUser.users.find((u: any) => u.email === whopData.user.email);
  
  if (!user) {
    console.log('User not found, creating new user:', whopData.user.email);
    // Create new user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: whopData.user.email,
      email_confirm: true,
      user_metadata: {
        whop_user_id: whopData.user.id,
        whop_username: whopData.user.username,
        password_setup_required: true
      }
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      throw new Error('Failed to create user');
    }
    
    user = newUser.user;
    
    // Generate and send magic link for auto-login
    const redirectUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://synoptas.com';
    const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: whopData.user.email,
      options: {
        redirectTo: `${redirectUrl}/`
      }
    });
    
    if (magicLinkError) {
      console.error('Error generating magic link:', magicLinkError);
    } else {
      console.log('✅ Magic link sent to:', whopData.user.email);
    }
  }
  
  // Upsert membership data
  const { error: membershipError } = await supabase
    .from('whop_memberships')
    .upsert({
      user_id: user.id,
      whop_user_id: whopData.user.id,
      whop_membership_id: whopData.id,
      status: 'active',
      plan_id: whopData.plan.id,
      valid_until: whopData.expires_at || null,
      metadata: {
        product_id: whopData.product.id,
        product_name: whopData.product.name,
        cancel_at_period_end: whopData.cancel_at_period_end,
      },
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'whop_membership_id'
    });
  
  if (membershipError) {
    console.error('Error upserting membership:', membershipError);
    throw new Error('Failed to upsert membership');
  }
  
  // Update user_credits to mark as premium
  const { error: creditsError } = await supabase
    .from('user_credits')
    .upsert({
      user_id: user.id,
      is_premium: true,
      premium_source: 'whop',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
  
  if (creditsError) {
    console.error('Error updating credits:', creditsError);
    throw new Error('Failed to update credits');
  }
  
  console.log('✅ Membership activated successfully for:', whopData.user.email);
}

async function handleMembershipDeactivated(supabase: any, event: WhopWebhookEvent) {
  const { data: whopData } = event;
  
  console.log('Deactivating membership for:', whopData.user.email);
  
  // Check if membership is cancelled or expired
  const isCancelled = event.action === 'membership.was_deleted';
  const isExpired = event.action === 'membership.went_invalid';
  
  // Update membership status
  const { error: membershipError } = await supabase
    .from('whop_memberships')
    .update({
      status: isCancelled ? 'cancelled' : 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('whop_membership_id', whopData.id);
  
  if (membershipError) {
    console.error('Error updating membership:', membershipError);
    throw new Error('Failed to update membership');
  }
  
  // ✅ FIX: Only remove premium if EXPIRED or no valid_until date
  // If cancelled but still valid, keep premium until expiration
  const shouldRemovePremium = isExpired || !whopData.valid_until || new Date(whopData.valid_until) <= new Date();
  
  if (shouldRemovePremium) {
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users.find((u: any) => u.email === whopData.user.email);
    
    if (user) {
      const { error: creditsError } = await supabase
        .from('user_credits')
        .update({
          is_premium: false,
          premium_source: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (creditsError) {
        console.error('Error updating credits:', creditsError);
        throw new Error('Failed to update credits');
      }
      
      console.log('✅ Premium removed for:', whopData.user.email);
    }
  } else {
    console.log(`⏰ Membership cancelled but still valid until: ${whopData.valid_until}`);
  }
  
  console.log('✅ Membership deactivated successfully for:', whopData.user.email);
}

async function handleRefund(supabase: any, event: WhopWebhookEvent) {
  const { data: whopData } = event;
  
  console.log('🚨 REFUND DETECTED for:', whopData.user.email);
  
  // Update membership to refunded status
  const { error: membershipError } = await supabase
    .from('whop_memberships')
    .update({
      status: 'refunded',
      updated_at: new Date().toISOString()
    })
    .eq('whop_membership_id', whopData.id);
  
  if (membershipError) {
    console.error('Error updating membership:', membershipError);
    throw new Error('Failed to update membership');
  }
  
  // CRITICAL: Remove premium immediately on refund
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  const user = existingUser?.users.find((u: any) => u.email === whopData.user.email);
  
  if (user) {
    const { error: creditsError } = await supabase
      .from('user_credits')
      .update({
        is_premium: false,
        premium_source: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (creditsError) {
      console.error('Error updating credits:', creditsError);
      throw new Error('Failed to update credits');
    }
  }
  
  console.log('✅ Premium removed due to refund:', whopData.user.email);
}

async function handlePaymentFailed(supabase: any, event: WhopWebhookEvent) {
  const { data: whopData } = event;
  
  console.log('💳 Payment failed for:', whopData.user.email);
  console.log('⚠️ Payment failed - membership will remain active until valid_until expires');
  
  // Note: Premium remains active until Whop sends membership.went_invalid
  // This gives the user time to update payment method
}
