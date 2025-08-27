import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    console.log("Starting fix for Andres account");

    // Fix Andres's account specifically
    const { data: updateResult, error: updateError } = await supabaseClient
      .from("subscribers")
      .update({
        subscription_tier: "Lite Plan",
        subscribed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", "andresquintero2@whccd.edu");

    if (updateError) {
      console.error("Error updating Andres account:", updateError);
      throw updateError;
    }

    console.log("Successfully updated Andres account:", updateResult);

    // Also reset his usage to allow him to continue using the service
    const { data: usageResult, error: usageError } = await supabaseClient
      .from("usage_tracking")
      .update({
        submissions_used: 200, // Give him some buffer below the 250 limit
        updated_at: new Date().toISOString(),
      })
      .eq("email", "andresquintero2@whccd.edu")
      .eq("month_year", "2025-08");

    if (usageError) {
      console.error("Error updating Andres usage:", usageError);
    } else {
      console.log("Successfully updated Andres usage:", usageResult);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Andres account fixed successfully",
      subscription_update: updateResult,
      usage_update: usageResult
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in fix-andres-account:", error);
    return new Response(JSON.stringify({
      error: error.message || "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});