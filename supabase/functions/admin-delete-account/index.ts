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

    const deletionResults = {
      usage_tracking: 0,
      submission_purchases: 0,
      referral_rewards: 0,
      referrals: 0,
      rubrics: 0,
      custom_gpt_files: 0,
      custom_gpts: 0,
      feature_notifications: 0,
      subscribers: 0,
      user_roles: 0,
      audit_logs: 0,
      profiles: 0
    };

    let errors = [];

    // Helper function for safe deletion with detailed logging
    const safeDelete = async (tableName: string, operation: () => Promise<any>, description: string) => {
      try {
        logStep(`Starting deletion: ${description}`);
        const result = await operation();
        const deletedCount = result.count || (result.data ? result.data.length : 0);
        deletionResults[tableName] = deletedCount;
        logStep(`Successfully deleted ${description}`, { deletedCount });
        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logStep(`Failed to delete ${description}`, { error: errorMsg });
        errors.push({ table: tableName, operation: description, error: errorMsg });
        return null;
      }
    };

    // Delete usage tracking
    await safeDelete('usage_tracking', 
      () => supabaseClient.from('usage_tracking').delete().eq('user_id', userId),
      'usage tracking data'
    );

    // Delete submission purchases
    await safeDelete('submission_purchases',
      () => supabaseClient.from('submission_purchases').delete().eq('user_id', userId),
      'submission purchases'
    );

    // Delete referral rewards
    await safeDelete('referral_rewards',
      () => supabaseClient.from('referral_rewards').delete().eq('user_id', userId),
      'referral rewards'
    );

    // Delete referrals (as referrer or referee)
    await safeDelete('referrals',
      () => supabaseClient.from('referrals').delete().or(`referrer_user_id.eq.${userId},referee_user_id.eq.${userId}`),
      'referrals'
    );

    // Delete rubrics
    await safeDelete('rubrics',
      () => supabaseClient.from('rubrics').delete().eq('user_id', userId),
      'rubrics'
    );

    // Delete custom GPTs and related files (FIXED: Execute subquery first)
    try {
      logStep("Starting custom GPT cleanup");
      
      // First, get the list of custom GPT IDs for this user
      const { data: customGptIds, error: gptQueryError } = await supabaseClient
        .from('custom_gpts')
        .select('id')
        .eq('user_id', userId);

      if (gptQueryError) {
        throw new Error(`Failed to fetch custom GPT IDs: ${gptQueryError.message}`);
      }

      logStep("Found custom GPTs", { count: customGptIds?.length || 0, gptIds: customGptIds });

      // Delete custom GPT files first (if any GPTs exist)
      if (customGptIds && customGptIds.length > 0) {
        const gptIdArray = customGptIds.map(gpt => gpt.id);
        await safeDelete('custom_gpt_files',
          () => supabaseClient.from('custom_gpt_files').delete().in('custom_gpt_id', gptIdArray),
          'custom GPT files'
        );
      } else {
        logStep("No custom GPTs found, skipping file deletion");
        deletionResults.custom_gpt_files = 0;
      }

      // Then delete the custom GPTs themselves
      await safeDelete('custom_gpts',
        () => supabaseClient.from('custom_gpts').delete().eq('user_id', userId),
        'custom GPTs'
      );

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logStep("Failed to delete custom GPTs and files", { error: errorMsg });
      errors.push({ table: 'custom_gpts', operation: 'custom GPT cleanup', error: errorMsg });
    }

    // Delete feature notifications
    await safeDelete('feature_notifications',
      () => supabaseClient.from('feature_notifications').delete().eq('user_id', userId),
      'feature notifications'
    );

    // Delete subscribers record
    await safeDelete('subscribers',
      () => supabaseClient.from('subscribers').delete().eq('user_id', userId),
      'subscriber record'
    );

    // Delete user roles
    await safeDelete('user_roles',
      () => supabaseClient.from('user_roles').delete().eq('user_id', userId),
      'user roles'
    );

    // Delete audit logs
    await safeDelete('audit_logs',
      () => supabaseClient.from('audit_logs').delete().eq('user_id', userId),
      'audit logs'
    );

    // Finally, delete the profile (this will also delete the auth user due to cascade)
    await safeDelete('profiles',
      () => supabaseClient.from('profiles').delete().eq('id', userId),
      'user profile'
    );

    // Log deletion summary
    logStep("Deletion summary", { deletionResults, errors, errorCount: errors.length });

    // Log the admin action with detailed results
    await supabaseClient.from('admin_actions').insert({
      admin_user_id: user.id,
      admin_email: user.email,
      target_user_email: userEmail,
      action_type: 'account_deleted',
      reason: reason || 'No reason provided',
      details: {
        target_user_name: targetUserData.full_name,
        had_stripe_customer: !!subscriptionData?.stripe_customer_id,
        subscription_tier: subscriptionData?.subscription_tier || 'Free Trial',
        deletion_results: deletionResults,
        errors: errors,
        total_errors: errors.length
      }
    });

    logStep("Admin action logged successfully");

    // Determine if deletion was completely successful
    const hasErrors = errors.length > 0;
    const successMessage = hasErrors 
      ? `Account for ${userEmail} has been deleted with ${errors.length} errors. Check logs for details.`
      : `Account for ${userEmail} has been permanently deleted successfully.`;

    return new Response(JSON.stringify({ 
      success: !hasErrors, 
      message: successMessage,
      deletion_summary: {
        records_deleted: deletionResults,
        errors: errors,
        total_errors: errors.length
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: hasErrors ? 207 : 200, // 207 = Multi-Status (partial success)
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