import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getSubmissionLimit } from "../_shared/plans.ts";

// Server-side submission-limit enforcement for the AI grader.
//
// The client checks the limit before calling this function, but a user could
// call the edge function directly and bypass that check. This is the
// server-side backstop.
//
// CRITICAL: fails OPEN. Any error, missing data, or ambiguity returns null
// (allow the grade). A bug in this check must never block a paying user
// mid-grade — the client-side check remains the primary gate; this only blocks
// when it can positively confirm the caller is at/over their limit.
export async function overLimitResponse(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return null;

    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) return null;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: userData } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    const email = userData?.user?.email;
    if (!email) return null;

    const { data: sub } = await admin
      .from("subscribers")
      .select("subscription_tier")
      .eq("email", email)
      .maybeSingle();

    const base = getSubmissionLimit(sub?.subscription_tier || "Free Trial");
    if (base < 0) return null; // unlimited tier

    const { data: purchased } = await admin.rpc("get_purchased_submissions", {
      user_email: email,
    });
    const totalLimit = base + (typeof purchased === "number" ? purchased : 0);

    const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: usageRow } = await admin
      .from("usage_tracking")
      .select("submissions_used")
      .eq("email", email)
      .eq("month_year", monthYear)
      .maybeSingle();
    const used = usageRow?.submissions_used ?? 0;

    if (used >= totalLimit) {
      return new Response(
        JSON.stringify({
          error: "submission_limit_reached",
          message: `You've reached your limit of ${totalLimit} submissions for this billing period. Purchase more submissions or upgrade your plan to continue.`,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    return null;
  } catch (_e) {
    return null; // fail open — never block on a check error
  }
}
