import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getTierByAmount } from "../_shared/plans.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RECONCILE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting subscription reconciliation");

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const body = await req.json();
    const { userEmail, forceRefresh } = body;

    if (userEmail) {
      // Reconcile specific user
      await reconcileUserSubscription(userEmail, supabaseService, stripe);
    } else {
      // Reconcile all active subscribers
      const { data: subscribers } = await supabaseService
        .from("subscribers")
        .select("email, stripe_customer_id")
        .eq("subscribed", true);

      if (subscribers) {
        for (const subscriber of subscribers) {
          if (subscriber.stripe_customer_id) {
            await reconcileUserSubscription(subscriber.email, supabaseService, stripe);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Reconciliation completed" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in reconcile-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function reconcileUserSubscription(userEmail: string, supabase: any, stripe: Stripe) {
  try {
    logStep("Reconciling user subscription", { userEmail });

    // Get user's current subscription from database
    const { data: currentSub } = await supabase
      .from("subscribers")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (!currentSub?.stripe_customer_id) {
      logStep("No Stripe customer ID found", { userEmail });
      return;
    }

    // Get current subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: currentSub.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    let subscriptionTier = "Free Trial";
    let subscriptionEnd = null;
    let billingCycleStart = null;
    let nextResetDate = null;
    const hasActiveSub = subscriptions.data.length > 0;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      billingCycleStart = new Date(subscription.current_period_start * 1000).toISOString();
      nextResetDate = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Get price to determine tier. Checkout mints ad-hoc Stripe prices, so
      // infer tier from the paid amount + interval via the shared catalog.
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      const interval = price.recurring?.interval === "year" ? "year" : "month";

      subscriptionTier = getTierByAmount(amount, interval);

      logStep("Determined subscription tier from Stripe", {
        priceId,
        amount,
        interval,
        subscriptionTier,
        userEmail
      });
    }

    // Check if data differs from current database record
    const needsUpdate = 
      currentSub.subscribed !== hasActiveSub ||
      currentSub.subscription_tier !== subscriptionTier ||
      currentSub.subscription_end !== subscriptionEnd ||
      currentSub.billing_cycle_start !== billingCycleStart ||
      currentSub.next_reset_date !== nextResetDate;

    if (needsUpdate) {
      // Update subscriber record
      const { error } = await supabase.from("subscribers").update({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        billing_cycle_start: billingCycleStart,
        next_reset_date: nextResetDate,
        updated_at: new Date().toISOString(),
      }).eq("email", userEmail);

      if (error) {
        logStep("Error updating subscriber", { error, userEmail });
      } else {
        logStep("Successfully reconciled subscription", {
          userEmail,
          oldTier: currentSub.subscription_tier,
          newTier: subscriptionTier,
          wasSubscribed: currentSub.subscribed,
          isSubscribed: hasActiveSub
        });
      }
    } else {
      logStep("Subscription data already up to date", { userEmail });
    }

  } catch (error) {
    logStep("Error reconciling user subscription", { error, userEmail });
  }
}