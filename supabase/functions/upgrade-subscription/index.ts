import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPGRADE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { planName, monthlyPrice, yearlyPrice, isYearly } = body;
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Find existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      throw new Error("Customer not found - please create a subscription first");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found existing customer", { customerId });

    // Find active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found - please create a subscription first");
    }

    const currentSubscription = subscriptions.data[0];
    logStep("Found active subscription", { 
      subscriptionId: currentSubscription.id,
      currentPriceId: currentSubscription.items.data[0].price.id
    });

    const price = isYearly ? yearlyPrice : monthlyPrice;
    const interval = isYearly ? "year" : "month";

    // Create new price for the upgrade
    const newPrice = await stripe.prices.create({
      currency: "usd",
      unit_amount: Math.round(price * 100),
      recurring: { interval },
      product_data: {
        name: `${planName} - ${isYearly ? 'Yearly' : 'Monthly'}`,
        metadata: {
          plan_name: planName,
          billing_interval: interval
        }
      },
      metadata: {
        plan_name: planName,
        billing_interval: interval
      }
    });

    logStep("Created new price", { priceId: newPrice.id, amount: newPrice.unit_amount });

    // Update the subscription with prorated billing
    const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
      items: [{
        id: currentSubscription.items.data[0].id,
        price: newPrice.id,
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        plan_name: planName,
        user_id: user.id,
        user_email: user.email,
        upgraded_at: new Date().toISOString()
      }
    });

    logStep("Subscription upgraded successfully", { 
      subscriptionId: updatedSubscription.id,
      newPriceId: newPrice.id,
      status: updatedSubscription.status
    });

    // Force refresh of subscription status
    const { error: refreshError } = await supabaseClient.functions.invoke('check-subscription', {
      headers: {
        Authorization: req.headers.get("Authorization")!,
      },
    });

    if (refreshError) {
      logStep("Warning: Failed to refresh subscription status", { error: refreshError });
    } else {
      logStep("Subscription status refreshed");
    }

    return new Response(JSON.stringify({ 
      success: true,
      subscription_id: updatedSubscription.id,
      new_plan: planName,
      message: `Successfully upgraded to ${planName}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in upgrade-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});