
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-SYNC-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Admin sync function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const adminUser = userData.user;
    if (!adminUser?.id) throw new Error("Admin user not authenticated");
    
    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabaseClient.rpc('has_role', {
      _user_id: adminUser.id,
      _role: 'admin'
    });

    if (adminError || !isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const body = await req.json();
    const { userEmail } = body;
    
    if (!userEmail) {
      throw new Error("User email is required");
    }

    logStep("Syncing subscription for user", { userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found for user", { userEmail });
      
      // Update as non-subscriber
      const currentDate = new Date().toISOString();
      const nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      
      await supabaseClient.from("subscribers").upsert({
        email: userEmail,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: "Free Trial",
        subscription_end: null,
        billing_cycle_start: currentDate,
        next_reset_date: nextResetDate.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "User has no Stripe customer record, updated to Free Trial",
        subscription_tier: "Free Trial"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for multiple subscription statuses to handle coupons, trials, etc.
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10, // Check more subscriptions to find valid ones
    });

    // Filter for valid subscription statuses
    const validSubscriptions = subscriptions.data.filter(sub => {
      const validStatuses = ['active', 'trialing', 'past_due'];
      const isValidStatus = validStatuses.includes(sub.status);
      
      // Also check for recently canceled subscriptions that are still within their period
      const isValidCanceled = sub.status === 'canceled' && 
        sub.current_period_end && 
        (sub.current_period_end * 1000) > Date.now();
      
      logStep("Subscription status check", { 
        subscriptionId: sub.id, 
        status: sub.status, 
        isValidStatus, 
        isValidCanceled,
        currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null
      });
      
      return isValidStatus || isValidCanceled;
    });

    // Sort by creation date to get the most recent valid subscription
    validSubscriptions.sort((a, b) => b.created - a.created);
    
    const hasActiveSub = validSubscriptions.length > 0;
    let subscriptionTier = "Free Trial";
    let subscriptionEnd = null;
    let billingCycleStart = new Date().toISOString();
    let nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    if (hasActiveSub) {
      const subscription = validSubscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      billingCycleStart = new Date(subscription.current_period_start * 1000).toISOString();
      nextResetDate = new Date(subscription.current_period_end * 1000);
      
      // Determine subscription tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Enhanced price to tier mapping with coupon handling
      if (amount >= 9999) { // $99.99
        subscriptionTier = "Super Plan";
      } else if (amount >= 6999) { // $69.99
        subscriptionTier = "Full-Time Plan";
      } else if (amount >= 1999) { // $19.99
        subscriptionTier = "Core Plan";
      } else if (amount >= 999) { // $9.99
        subscriptionTier = "Lite Plan";
      } else if (amount === 0) {
        // For $0 subscriptions (coupons), check the product/price metadata or use fallback
        logStep("Zero amount subscription detected - likely coupon", { priceId, subscriptionId: subscription.id });
        
        // Try to get the original price amount from the product or price metadata
        try {
          const product = await stripe.products.retrieve(price.product as string);
          logStep("Product metadata for zero amount sub", { productMetadata: product.metadata });
          
          // Check if there's a tier indicated in metadata
          if (product.metadata?.tier) {
            subscriptionTier = product.metadata.tier;
          } else if (product.name?.toLowerCase().includes('lite')) {
            subscriptionTier = "Lite Plan";
          } else if (product.name?.toLowerCase().includes('core')) {
            subscriptionTier = "Core Plan";
          } else if (product.name?.toLowerCase().includes('full')) {
            subscriptionTier = "Full-Time Plan";
          } else {
            // Default for coupon subscriptions - assume Lite Plan
            subscriptionTier = "Lite Plan";
          }
        } catch (productError) {
          logStep("Error retrieving product for zero amount sub", { error: productError });
          subscriptionTier = "Lite Plan"; // Safe default for coupons
        }
      }
      
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    }

    // Update database
    const { error: upsertError } = await supabaseClient.from("subscribers").upsert({
      email: userEmail,
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
      throw new Error(`Failed to update database: ${upsertError.message}`);
    }

    logStep("Successfully synced subscription data", { 
      userEmail, 
      subscriptionTier, 
      subscribed: hasActiveSub 
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: "Subscription data synced successfully",
      subscription_tier: subscriptionTier,
      subscribed: hasActiveSub
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-sync-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
