import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received", { method: req.method });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const sig = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody, 
        sig, 
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Check for duplicate processing using idempotency
    const { data: existingEvent } = await supabaseService
      .from("webhook_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .single();

    if (existingEvent) {
      logStep("Event already processed", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, status: "already_processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Log the webhook event
    await supabaseService.from("webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed_at: new Date().toISOString(),
      event_data: event.data.object
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseService, stripe);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseService, stripe);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseService);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, supabaseService, stripe);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseService);
        break;
      
      default:
        logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: any, supabase: any, stripe: Stripe) {
  logStep("Processing checkout.session.completed", { sessionId: session.id });
  
  if (session.mode === 'payment') {
    // Handle one-time payment (submission purchase)
    const { error } = await supabase
      .from("submission_purchases")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", session.id);
    
    if (error) {
      logStep("Error updating submission purchase", { error });
    } else {
      logStep("Submission purchase completed", { sessionId: session.id });
    }
  } else if (session.mode === 'subscription') {
    // Handle subscription setup
    await updateSubscriptionFromStripe(session.customer, supabase, stripe);
  }
}

async function handleSubscriptionUpdated(subscription: any, supabase: any, stripe: Stripe) {
  logStep("Processing customer.subscription.updated", { 
    subscriptionId: subscription.id,
    status: subscription.status 
  });
  
  await updateSubscriptionFromStripe(subscription.customer, supabase, stripe);
}

async function handleSubscriptionDeleted(subscription: any, supabase: any) {
  logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });
  
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  if (customer && !customer.deleted) {
    await supabase.from("subscribers").upsert({
      email: customer.email,
      stripe_customer_id: customer.id,
      subscribed: false,
      subscription_tier: "Free Trial",
      subscription_end: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });
  }
}

async function handleInvoicePaid(invoice: any, supabase: any, stripe: Stripe) {
  logStep("Processing invoice.paid", { invoiceId: invoice.id });
  
  if (invoice.subscription) {
    await updateSubscriptionFromStripe(invoice.customer, supabase, stripe);
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabase: any) {
  logStep("Processing invoice.payment_failed", { invoiceId: invoice.id });
  
  // Could implement logic to handle failed payments
  // For now, just log the event
}

async function updateSubscriptionFromStripe(customerId: string, supabase: any, stripe: Stripe) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted || !customer.email) {
      logStep("Invalid customer", { customerId });
      return;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
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
      
      // Get price to determine tier
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      // Map price IDs and amounts to subscription tiers
      const priceToTierMap: { [key: string]: string } = {
        'price_1QbkZqE6GV5VVdXqHDYWl8lN': 'Lite Plan',     // $24.95/month
        'price_1QbkaIE6GV5VVdXqaI4bGTBX': 'Lite Plan',     // $249.50/year
        'price_1QbkbJE6GV5VVdXq8RWMCMIp': 'Core Plan',     // $74.95/month
        'price_1QbkbgE6GV5VVdXqhKnP5xar': 'Core Plan',     // $749.50/year
        'price_1QbkcXE6GV5VVdXqJLWiFlYb': 'Full-Time Plan', // $199.95/month
        'price_1QbkctE6GV5VVdXqtWzGNxjL': 'Full-Time Plan', // $1999.50/year
        'price_1QbkdOE6GV5VVdXqwLz4vCAW': 'Super Plan',    // $299.95/month
        'price_1QbkdlE6GV5VVdXqZLpHMmwC': 'Super Plan',    // $2999.50/year
      };
      
      subscriptionTier = priceToTierMap[priceId] || determineTierByAmount(amount);
      
      logStep("Determined subscription tier", { 
        priceId, 
        amount, 
        subscriptionTier,
        billingCycleStart,
        nextResetDate 
      });
    }

    // Update subscriber record
    await supabase.from("subscribers").upsert({
      email: customer.email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      billing_cycle_start: billingCycleStart,
      next_reset_date: nextResetDate,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated subscription from webhook", {
      email: customer.email,
      subscribed: hasActiveSub,
      subscriptionTier
    });

  } catch (error) {
    logStep("Error updating subscription from Stripe", { error, customerId });
  }
}

function determineTierByAmount(amount: number): string {
  if (amount >= 29995) return "Super Plan";      // $299.95+
  if (amount >= 19995) return "Full-Time Plan";  // $199.95+
  if (amount >= 7495) return "Core Plan";        // $74.95+
  if (amount >= 2495) return "Lite Plan";        // $24.95+
  return "Free Trial";
}