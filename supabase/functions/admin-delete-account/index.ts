import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating admin user");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("Admin user authenticated", { userId: user.id, email: user.email });

    // Verify admin role
    const { data: roleData, error: roleError } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !roleData) {
      logStep("Admin role verification failed", { roleError, roleData });
      throw new Error("Unauthorized: Admin role required");
    }
    logStep("Admin role verified");

    // Parse request body
    const { userEmail, reason } = await req.json();
    if (!userEmail) throw new Error("User email is required");
    logStep("Request parsed", { userEmail, reason });

    // Get user details from Supabase
    const { data: targetUserData, error: targetUserError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', userEmail)
      .single();

    if (targetUserError) {
      logStep("Error fetching target user data", { error: targetUserError });
      throw new Error(`Failed to fetch user data: ${targetUserError.message}`);
    }

    if (!targetUserData) {
      throw new Error(`No user found with email ${userEmail}`);
    }

    logStep("Target user data retrieved", { targetUserData });

    // Get subscription data to check for Stripe customer
    const { data: subscriptionData } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id, subscription_tier')
      .eq('email', userEmail)
      .single();

    logStep("Subscription data retrieved", { subscriptionData });

    // If user has Stripe customer ID, cancel their subscriptions
    if (subscriptionData?.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      
      logStep("Canceling Stripe subscriptions", { stripe_customer_id: subscriptionData.stripe_customer_id });
      
      const subscriptions = await stripe.subscriptions.list({
        customer: subscriptionData.stripe_customer_id,
        status: 'active',
      });

      logStep("Active Stripe subscriptions found", { count: subscriptions.data.length });

      // Cancel all active subscriptions
      for (const subscription of subscriptions.data) {
        logStep("Canceling subscription", { subscriptionId: subscription.id });
        
        await stripe.subscriptions.cancel(subscription.id);
        
        logStep("Subscription canceled successfully", { subscriptionId: subscription.id });
      }
    } else {
      logStep("No Stripe customer ID found - free account, skipping Stripe operations");
    }

    // Delete user data from all tables (in order to respect foreign key constraints)
    const userId = targetUserData.id;
    
    // Delete from dependent tables first
    logStep("Starting database cleanup for user", { userId, userEmail });

    // Delete usage tracking
    await supabaseClient
      .from('usage_tracking')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted usage tracking data");

    // Delete submission purchases
    await supabaseClient
      .from('submission_purchases')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted submission purchases");

    // Delete referral rewards
    await supabaseClient
      .from('referral_rewards')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted referral rewards");

    // Delete referrals (as referrer or referee)
    await supabaseClient
      .from('referrals')
      .delete()
      .or(`referrer_user_id.eq.${userId},referee_user_id.eq.${userId}`);
    logStep("Deleted referrals");

    // Delete rubrics
    await supabaseClient
      .from('rubrics')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted rubrics");

    // Delete custom GPTs and related files
    await supabaseClient
      .from('custom_gpt_files')
      .delete()
      .in('custom_gpt_id', 
        supabaseClient
          .from('custom_gpts')
          .select('id')
          .eq('user_id', userId)
      );
    
    await supabaseClient
      .from('custom_gpts')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted custom GPTs and files");

    // Delete feature notifications
    await supabaseClient
      .from('feature_notifications')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted feature notifications");

    // Delete subscribers record
    await supabaseClient
      .from('subscribers')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted subscriber record");

    // Delete user roles
    await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted user roles");

    // Delete audit logs
    await supabaseClient
      .from('audit_logs')
      .delete()
      .eq('user_id', userId);
    logStep("Deleted audit logs");

    // Finally, delete the profile (this will also delete the auth user due to cascade)
    await supabaseClient
      .from('profiles')
      .delete()
      .eq('id', userId);
    logStep("Deleted user profile");

    // Log the admin action
    await supabaseClient.from('admin_actions').insert({
      admin_user_id: user.id,
      admin_email: user.email,
      target_user_email: userEmail,
      action_type: 'account_deleted',
      reason: reason || 'No reason provided',
      details: {
        target_user_name: targetUserData.full_name,
        had_stripe_customer: !!subscriptionData?.stripe_customer_id,
        subscription_tier: subscriptionData?.subscription_tier || 'Free Trial'
      }
    });

    logStep("Admin action logged successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Account for ${userEmail} has been permanently deleted` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-delete-account", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});