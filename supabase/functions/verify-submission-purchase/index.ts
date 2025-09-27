
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-SUBMISSION-PURCHASE] ${step}${detailsStr}`);
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
    const { sessionId } = body;
    
    if (!sessionId) throw new Error("Session ID is required");
    
    logStep("Verifying session", { sessionId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Retrieved session", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email 
    });

    // Get customer from session to verify ownership
    let verified = false;
    
    logStep("Starting verification", { 
      sessionCustomerEmail: session.customer_email, 
      sessionCustomer: session.customer,
      userEmail: user.email 
    });
    
    // First check: direct email match
    if (session.customer_email === user.email) {
      verified = true;
      logStep("Verified by email match");
    } else if (session.customer) {
      // Second check: verify by stripe_customer_id
      logStep("Checking stripe customer ID verification");
      
      const { data: subscriber, error: subError } = await supabaseClient
        .from("subscribers")
        .select("stripe_customer_id, email")
        .eq("email", user.email)
        .single();
        
      logStep("Subscriber lookup result", { 
        subscriber, 
        error: subError,
        lookupEmail: user.email 
      });
        
      if (subscriber?.stripe_customer_id === session.customer) {
        verified = true;
        logStep("Verified by stripe customer ID match");
      } else {
        logStep("Stripe customer ID mismatch", {
          subscriberCustomerId: subscriber?.stripe_customer_id,
          sessionCustomerId: session.customer
        });
      }
    } else {
      logStep("No customer information in session");
    }

    if (!verified) {
      logStep("Verification failed", {
        sessionCustomerEmail: session.customer_email,
        sessionCustomer: session.customer,
        userEmail: user.email,
        allChecksPerformed: true
      });
      throw new Error("Session does not belong to authenticated user");
    }
    
    logStep("User verification successful");

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Payment not completed yet",
        paymentStatus: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Use service role key to update the purchase record
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update the purchase record status
    const { data: updateData, error: updateError } = await supabaseService
      .from("submission_purchases")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId)
      .eq("email", user.email)
      .select();

    if (updateError) {
      logStep("Error updating purchase record", { error: updateError });
      throw new Error("Failed to update purchase record");
    }

    if (!updateData || updateData.length === 0) {
      logStep("No purchase record found", { sessionId, email: user.email });
      throw new Error("No matching purchase record found");
    }

    logStep("Purchase record updated successfully", { 
      recordId: updateData[0].id,
      submissions: updateData[0].submissions_purchased 
    });

    // Get updated purchased submissions count
    const { data: purchasedData, error: purchasedError } = await supabaseService.rpc('get_purchased_submissions', {
      user_email: user.email
    });

    if (purchasedError) {
      logStep("Error getting purchased submissions", { error: purchasedError });
    }

    logStep("Fetched purchased submissions", { 
      email: user.email, 
      total: purchasedData ?? 0
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment verified and submissions added",
      submissionsAdded: updateData[0].submissions_purchased,
      totalPurchasedSubmissions: purchasedData || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-submission-purchase", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
