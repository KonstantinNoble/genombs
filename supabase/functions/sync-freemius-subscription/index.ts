import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const freemiusProductId = Deno.env.get('FREEMIUS_PRODUCT_ID');
    const freemiusApiKey = Deno.env.get('FREEMIUS_API_KEY');
    const freemiusSecretKey = Deno.env.get('FREEMIUS_SECRET_KEY');
    const freemiusPublicKey = Deno.env.get('FREEMIUS_PUBLIC_KEY');
    
    if (!freemiusProductId || !freemiusApiKey || !freemiusSecretKey || !freemiusPublicKey) {
      console.error('❌ Freemius API credentials not configured');
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
      console.error('❌ Error verifying user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Syncing Freemius subscription for user:', user.id);

    // Get user's current credit record
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('freemius_customer_id, freemius_subscription_id, is_premium')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('❌ Error fetching user credits:', creditsError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!userCredits?.freemius_customer_id) {
      console.log('⚠️ No Freemius customer ID found for user:', user.id);
      return new Response(
        JSON.stringify({ 
          message: 'No Freemius customer ID found for this user',
          synced: false 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch subscription from Freemius API using SDK approach
    console.log('📡 Fetching subscription from Freemius API for customer:', userCredits.freemius_customer_id);
    
    try {
      // Use Freemius API v1 endpoint with proper authentication
      const apiUrl = `https://api.freemius.com/v1/plugins/${freemiusProductId}/users/${userCredits.freemius_customer_id}/subscriptions.json`;
      
      // Create authentication string (public_key:secret_key)
      const authString = btoa(`${freemiusPublicKey}:${freemiusSecretKey}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Freemius API error:', response.status, errorText);
        
        return new Response(
          JSON.stringify({ 
            message: 'Could not verify with Freemius API - keeping current premium status',
            synced: false,
            error: `API error: ${response.status}`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('📦 Freemius API response:', JSON.stringify(data, null, 2));
      
      // Find active subscription
      const subscriptions = data.subscriptions || [];
      const activeSubscription = subscriptions.find((s: any) => s.status === 'active') || subscriptions[0];

      if (!activeSubscription) {
        console.log('⚠️ No active subscription found - updating to free');
        
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
          console.error('❌ Error updating user credits:', updateError);
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
        auto_renew: activeSubscription.auto_renew,
        freemius_subscription_id: activeSubscription.id,
      };

      // Determine premium status based on subscription status
      if (activeSubscription.status === 'active') {
        updateData.is_premium = true;
        if (activeSubscription.next_payment_date) {
          updateData.next_payment_date = new Date(activeSubscription.next_payment_date).toISOString();
        }
      } else if (activeSubscription.status === 'cancelled' || activeSubscription.status === 'expired') {
        // Check if subscription has expired
        if (activeSubscription.ends) {
          const endDate = new Date(activeSubscription.ends);
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
        console.error('❌ Error updating user credits:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update subscription status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Successfully synced subscription for user:', user.id, updateData);

      return new Response(
        JSON.stringify({ 
          message: 'Subscription synced successfully',
          synced: true,
          subscription: {
            status: activeSubscription.status,
            auto_renew: activeSubscription.auto_renew,
            is_premium: updateData.is_premium,
            next_payment_date: activeSubscription.next_payment_date || null,
            ends: activeSubscription.ends || null,
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('❌ Error calling Freemius API:', apiError);
      return new Response(
        JSON.stringify({ 
          message: 'Could not verify with Freemius API',
          synced: false,
          error: apiError instanceof Error ? apiError.message : 'Unknown error'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
