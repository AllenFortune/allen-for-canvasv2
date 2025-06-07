
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-USAGE-RESET] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting daily usage reset check");

    // Create Supabase client with service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all users whose next_reset_date is today or past
    const { data: usersToReset, error: queryError } = await supabaseService
      .from("subscribers")
      .select("email, next_reset_date, subscription_tier")
      .lte("next_reset_date", new Date().toISOString());

    if (queryError) {
      logStep("Error querying users to reset", { error: queryError });
      throw queryError;
    }

    logStep("Found users to reset", { count: usersToReset?.length || 0 });

    if (!usersToReset || usersToReset.length === 0) {
      logStep("No users need reset today");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No users need reset today",
        usersReset: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Reset each user's submissions
    for (const user of usersToReset) {
      try {
        logStep("Resetting user", { email: user.email });
        
        const { error: resetError } = await supabaseService.rpc('reset_user_submissions', {
          user_email: user.email
        });

        if (resetError) {
          logStep("Error resetting user", { email: user.email, error: resetError });
          errorCount++;
          errors.push({ email: user.email, error: resetError.message });
        } else {
          logStep("Successfully reset user", { email: user.email });
          successCount++;
        }
      } catch (error) {
        logStep("Unexpected error resetting user", { email: user.email, error });
        errorCount++;
        errors.push({ email: user.email, error: error.message });
      }
    }

    logStep("Reset process completed", { 
      totalUsers: usersToReset.length,
      successCount,
      errorCount 
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Reset completed. ${successCount} users reset successfully, ${errorCount} errors.`,
      usersReset: successCount,
      errors: errors
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in daily-usage-reset", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
