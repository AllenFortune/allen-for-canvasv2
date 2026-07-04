// Canonical, server-authoritative plan catalog.
//
// This is the single source of truth for what a plan costs. Checkout and
// upgrade functions MUST derive the Stripe amount from here by plan name and
// never trust a price supplied in the request body — otherwise a caller can
// self-select any tier for an arbitrary amount (e.g. $0.01).
//
// Prices are in whole dollars and must match the advertised prices in
// src/pages/Pricing.tsx. Yearly = 10x monthly (two months free).

export interface PlanDefinition {
  name: string;
  monthlyPrice: number; // USD
  yearlyPrice: number; // USD
  submissionLimit: number; // -1 = unlimited
  sellable: boolean; // false = legacy/grandfathered, not offered at checkout
}

export const PLAN_CATALOG: Record<string, PlanDefinition> = {
  "Free Trial": {
    name: "Free Trial",
    monthlyPrice: 0,
    yearlyPrice: 0,
    submissionLimit: 10,
    sellable: false, // handled without Stripe checkout
  },
  "Lite Plan": {
    name: "Lite Plan",
    monthlyPrice: 9.0,
    yearlyPrice: 90.0,
    submissionLimit: 250,
    sellable: true,
  },
  "Core Plan": {
    name: "Core Plan",
    monthlyPrice: 19.0,
    yearlyPrice: 190.0,
    submissionLimit: 750,
    sellable: true,
  },
  "Full-Time Plan": {
    name: "Full-Time Plan",
    monthlyPrice: 59.0,
    yearlyPrice: 590.0,
    submissionLimit: -1,
    sellable: true,
  },
  // Legacy tier: no longer sold via checkout, but grandfathered subscribers
  // still resolve to it. Kept so tier/limit lookups never fall back to trial.
  "Super Plan": {
    name: "Super Plan",
    monthlyPrice: 299.95,
    yearlyPrice: 2999.5,
    submissionLimit: -1,
    sellable: false,
  },
};

// Returns the server-authoritative price (USD) for a plan + billing interval,
// or null if the plan is unknown or not sellable at checkout.
export function getPlanPrice(
  planName: string,
  isYearly: boolean,
): number | null {
  const plan = PLAN_CATALOG[planName];
  if (!plan || !plan.sellable) return null;
  return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
}

// Tiers ordered high → low for amount-based detection.
const TIER_ORDER = ["Super Plan", "Full-Time Plan", "Core Plan", "Lite Plan"];

// Maps a paid amount to a subscription tier. Because checkout mints ad-hoc
// Stripe prices, price-ID maps don't match live subscriptions — tier must be
// inferred from the paid amount. `interval` selects the catalog column so a
// yearly amount is compared against yearly prices (not monthly), and the 0.9
// factor tolerates small coupon reductions without dropping a tier.
// Single source of truth for stripe-webhooks, check-subscription, reconcile.
export function getTierByAmount(
  amountCents: number,
  interval: "month" | "year" = "month",
): string {
  for (const tier of TIER_ORDER) {
    const plan = PLAN_CATALOG[tier];
    const baseDollars = interval === "year" ? plan.yearlyPrice : plan.monthlyPrice;
    const minCents = Math.round(baseDollars * 100 * 0.9);
    if (amountCents >= minCents) return tier;
  }
  return "Free Trial";
}

// Submission limit for a tier (-1 = unlimited). Unknown tiers fall back to the
// Free Trial limit rather than an arbitrary constant.
export function getSubmissionLimit(tier: string): number {
  return PLAN_CATALOG[tier]?.submissionLimit ?? PLAN_CATALOG["Free Trial"].submissionLimit;
}
