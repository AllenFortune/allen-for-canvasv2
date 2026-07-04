
export const PLAN_LIMITS = {
  'Free Trial': 10,
  'Lite Plan': 250,
  'Core Plan': 750,
  'Full-Time Plan': -1, // -1 represents unlimited
  'Super Plan': -1, // legacy tier, priced above Full-Time — unlimited
} as const;
