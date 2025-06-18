
export const PLAN_HIERARCHY = {
  'Free Trial': 0,
  'Lite Plan': 1,
  'Core Plan': 2,
  'Full-Time Plan': 3,
  'Super Plan': 4
} as const;

export type PlanName = keyof typeof PLAN_HIERARCHY;

export const getPlanLevel = (planName: string): number => {
  return PLAN_HIERARCHY[planName as PlanName] ?? 0;
};

export const comparePlans = (currentPlan: string, targetPlan: string) => {
  const currentLevel = getPlanLevel(currentPlan);
  const targetLevel = getPlanLevel(targetPlan);
  
  if (currentLevel === targetLevel) return 'current';
  if (targetLevel > currentLevel) return 'upgrade';
  return 'downgrade';
};

export const getPlanButtonText = (comparison: 'current' | 'upgrade' | 'downgrade', originalButtonText: string) => {
  switch (comparison) {
    case 'current':
      return 'Current Plan';
    case 'upgrade':
      return 'Upgrade';
    case 'downgrade':
      return 'Change Plan';
    default:
      return originalButtonText;
  }
};
