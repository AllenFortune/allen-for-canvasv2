
export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  billing_cycle_start: string | null;
  next_reset_date: string | null;
  days_remaining: number;
}

export interface UsageData {
  submissions_used: number;
  limit: number;
  purchased_submissions: number;
  total_limit: number;
  percentage: number;
  billing_period: string | null;
}
