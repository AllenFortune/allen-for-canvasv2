
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminUser {
  subscription_tier: string;
}

interface AdminPlanDistributionProps {
  users: AdminUser[];
}

const AdminPlanDistribution = ({ users }: AdminPlanDistributionProps) => {
  const planDistribution = users.reduce((acc, user) => {
    acc[user.subscription_tier] = (acc[user.subscription_tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(planDistribution).map(([plan, count]) => (
            <div key={plan} className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">{plan}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPlanDistribution;
