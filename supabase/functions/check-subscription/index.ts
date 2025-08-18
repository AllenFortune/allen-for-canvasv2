
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    // Handle specific session expiration error
    if (userError) {
      if (userError.message.includes("Session from session_id claim in JWT does not exist") || 
          userError.message.includes("Session not found")) {
        logStep("Session expired or invalid", { error: userError.message });
        return new Response(JSON.stringify({ 
          error: "SESSION_EXPIRED",
          message: "Your session has expired. Please log in again."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Use current date for billing_cycle_start for non-subscribers
      const currentDate = new Date().toISOString();
      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      
      const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "Free Trial",
        subscription_end: null,
        billing_cycle_start: currentDate,
        next_reset_date: nextResetDate.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      if (upsertError) {
        logStep("Database upsert error for non-subscriber", { error: upsertError });
      }
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        subscription_tier: "Free Trial",
        subscription_end: null,
        billing_cycle_start: currentDate,
        next_reset_date: nextResetDate.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "Free Trial";
    let subscriptionEnd = null;
    let billingCycleStart = new Date().toISOString();
    let nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      billingCycleStart = new Date(subscription.current_period_start * 1000).toISOString();
      nextResetDate = new Date(subscription.current_period_end * 1000);
      
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      logStep("Price details retrieved", { priceId, amount, currency: price.currency });
      
      // First try explicit price ID mapping for known price IDs
      const priceIdToTierMap: { [key: string]: string } = {
        'price_1RXUqTGG0TRs3C9HhMklQ6OX': 'Lite Plan', // Known Lite Plan price ID
        'price_1RfZ7nGG0TRs3C9Hdv7X8esV': 'Lite Plan', // Another Lite Plan price ID
        'price_1RxIaOGG0TRs3C9Hzx4y8frJ': 'Lite Plan', // Lite Plan from logs
        'price_1RXUq9GG0TRs3C9HyLzQcO5X': 'Core Plan', // Core Plan price ID
        'price_1RfZ7nGG0TRs3C9Hcore123': 'Core Plan', // Another Core Plan price ID
      };
      
      if (priceIdToTierMap[priceId]) {
        subscriptionTier = priceIdToTierMap[priceId];
        logStep("Tier determined by price ID mapping", { priceId, subscriptionTier });
      } else {
        // Fallback to amount-based mapping with enhanced logging
        if (amount >= 9999) { // $99.99+
          subscriptionTier = "Super Plan";
        } else if (amount >= 6999) { // $69.99+
          subscriptionTier = "Full-Time Plan";
        } else if (amount >= 4999) { // $49.99+ (Core Plan)
          subscriptionTier = "Core Plan";
        } else if (amount >= 1900) { // $19.00+ (Lite Plan)
          subscriptionTier = "Lite Plan";
        } else if (amount >= 900) { // $9.00+
          subscriptionTier = "Lite Plan";
        } else {
          subscriptionTier = "Free Trial"; // Fallback for unexpected amounts
        }
        logStep("Tier determined by amount mapping", { priceId, amount, subscriptionTier });
        
        // Log unknown price IDs for future mapping
        if (!priceIdToTierMap[priceId]) {
          logStep("Unknown price ID encountered - add to mapping", { priceId, amount, detectedTier: subscriptionTier });
        }
      }
    } else {
      logStep("No active subscription found");
    }

    // Update database with proper billing cycle information
    const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      billing_cycle_start: billingCycleStart,
      next_reset_date: nextResetDate.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (upsertError) {
      logStep("Database upsert error", { error: upsertError });
      // Continue execution even if database update fails
    } else {
      logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    }
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      billing_cycle_start: billingCycleStart,
      next_reset_date: nextResetDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
