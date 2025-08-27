import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-RESUME-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Admin resume account function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const adminUser = userData.user;
    if (!adminUser?.email) throw new Error("Admin user not authenticated");
    logStep("Admin authenticated", { adminEmail: adminUser.email });

    // Verify admin role
    const { data: adminCheck } = await supabaseClient.rpc('has_role', {
      _user_id: adminUser.id,
      _role: 'admin'
    });

    if (!adminCheck) {
      throw new Error("User does not have admin privileges");
    }

    const { userEmail, reason } = await req.json();
    if (!userEmail) throw new Error("User email is required");

    logStep("Resuming account for user", { userEmail, reason, adminEmail: adminUser.email });

    // Get user's Stripe customer ID
    const { data: subscriber, error: subError } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id, account_status")
      .eq("email", userEmail)
      .single();

    if (subError || !subscriber) {
      throw new Error("User not found in subscribers table");
    }

    if (subscriber.account_status !== 'paused') {
      throw new Error("Account is not currently paused");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get paused subscriptions for this customer
    if (subscriber.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: subscriber.stripe_customer_id,
        status: "active",
      });

      // Resume all paused subscriptions
      for (const subscription of subscriptions.data) {
        if (subscription.pause_collection) {
          await stripe.subscriptions.update(subscription.id, {
            pause_collection: null, // Resume billing
          });
          logStep("Resumed Stripe subscription", { subscriptionId: subscription.id });
        }
      }
    }

    // Update database to mark account as active
    const { error: updateError } = await supabaseClient
      .from("subscribers")
      .update({
        account_status: 'active',
        paused_at: null,
        paused_by: null,
        pause_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", userEmail);

    if (updateError) throw updateError;

    // Log admin action
    const { error: logError } = await supabaseClient
      .from("admin_actions")
      .insert({
        admin_user_id: adminUser.id,
        admin_email: adminUser.email,
        target_user_email: userEmail,
        action_type: 'resume_account',
        reason: reason || 'No reason provided',
        details: {
          stripe_customer_id: subscriber.stripe_customer_id,
          previous_status: 'paused'
        }
      });

    if (logError) {
      console.error("Failed to log admin action:", logError);
    }

    logStep("Successfully resumed account", { userEmail, adminEmail: adminUser.email });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Account for ${userEmail} has been resumed` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-resume-account", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});