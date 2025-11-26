import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FreemiusSubscription {
  id: string;
  plan_id: string;
  installment_id: string | null;
  status: string;
  created: string;
  next_payment_date?: string;
  ends?: string;
  auto_renew: boolean;
}

interface FreemiusApiResponse {
  subscriptions?: FreemiusSubscription[];
}

async function fetchFreemiusSubscription(
  customerId: string,
  publicKey: string,
  secretKey: string
): Promise<{ subscription: FreemiusSubscription | null; error: boolean }> {
  try {
    // Freemius API uses Basic Auth with public_key:secret_key
    const authString = btoa(`${publicKey}:${secretKey}`);
    
    // Fetch subscriptions for this customer
    const response = await fetch(
      `https://api.freemius.com/v1/users/${customerId}/subscriptions.json`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Freemius API error:', response.status, await response.text());
      return { subscription: null, error: true }; // API error - don't change status
    }

    const data: FreemiusApiResponse = await response.json();
    
    // Return the first active subscription (most relevant)
    const activeSubscription = data.subscriptions?.find(s => s.status === 'active');
    return { subscription: activeSubscription || data.subscriptions?.[0] || null, error: false };
  } catch (error) {
    console.error('Error fetching Freemius subscription:', error);
    return { subscription: null, error: true }; // Network/parsing error - don't change status
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const freemiusPublicKey = Deno.env.get('FREEMIUS_PUBLIC_KEY');
    const freemiusSecretKey = Deno.env.get('FREEMIUS_SECRET_KEY');
    
    if (!freemiusPublicKey || !freemiusSecretKey) {
      console.error('Freemius API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Freemius API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error verifying user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Syncing Freemius subscription for user:', user.id);

    // Get user's current credit record
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('freemius_customer_id, freemius_subscription_id, is_premium')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching user credits:', creditsError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userCredits?.freemius_customer_id) {
      return new Response(
        JSON.stringify({ 
          message: 'No Freemius customer ID found for this user',
          synced: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch subscription from Freemius API
    const { subscription, error: apiError } = await fetchFreemiusSubscription(
      userCredits.freemius_customer_id,
      freemiusPublicKey,
      freemiusSecretKey
    );

    // If API error occurred, don't change the current status
    if (apiError) {
      return new Response(
        JSON.stringify({ 
          message: 'Could not verify with Freemius API - keeping current premium status',
          synced: false,
          error: 'API authentication failed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscription) {
      // No active subscription found - update to free
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          is_premium: false,
          auto_renew: false,
          subscription_end_date: null,
          next_payment_date: null,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          message: 'No active subscription found - updated to free plan',
          synced: true,
          is_premium: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user_credits with Freemius subscription data
    const updateData: any = {
      auto_renew: subscription.auto_renew,
      freemius_subscription_id: subscription.id,
    };

    // Determine premium status based on subscription status
    if (subscription.status === 'active') {
      updateData.is_premium = true;
      if (subscription.next_payment_date) {
        updateData.next_payment_date = new Date(subscription.next_payment_date).toISOString();
      }
    } else if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      // Check if subscription has expired
      if (subscription.ends) {
        const endDate = new Date(subscription.ends);
        updateData.subscription_end_date = endDate.toISOString();
        updateData.is_premium = endDate > new Date();
      } else {
        updateData.is_premium = false;
      }
      updateData.auto_renew = false;
      updateData.next_payment_date = null;
    }

    const { error: updateError } = await supabase
      .from('user_credits')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating user credits:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully synced subscription for user:', user.id, updateData);

    return new Response(
      JSON.stringify({ 
        message: 'Subscription synced successfully',
        synced: true,
        subscription: {
          status: subscription.status,
          auto_renew: subscription.auto_renew,
          is_premium: updateData.is_premium,
          next_payment_date: subscription.next_payment_date || null,
          ends: subscription.ends || null,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
