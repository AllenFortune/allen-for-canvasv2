import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Users } from 'lucide-react';

interface RevenueStats {
  current_month_mrr: number;
  previous_month_mrr: number;
  growth_percentage: number;
  current_month_name: string;
  previous_month_name: string;
}

interface WeeklyStats {
  current_week_new_mrr: number;
  previous_week_new_mrr: number;
  week_growth_percentage: number;
  new_subscribers_this_week: number;
  churned_this_week: number;
}

interface AdminRevenueAnalyticsProps {
  revenueStats: RevenueStats | null;
  weeklyStats: WeeklyStats | null;
}

const AdminRevenueAnalytics = ({ revenueStats, weeklyStats }: AdminRevenueAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const annualRunRate = revenueStats ? revenueStats.current_month_mrr * 12 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
        
        {/* Monthly Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueStats ? formatCurrency(revenueStats.current_month_mrr) : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueStats?.current_month_name || 'Current Month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Previous MRR</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenueStats ? formatCurrency(revenueStats.previous_month_mrr) : formatCurrency(0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenueStats?.previous_month_name || 'Previous Month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              {revenueStats && revenueStats.growth_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${revenueStats && revenueStats.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueStats ? `${revenueStats.growth_percentage >= 0 ? '+' : ''}${revenueStats.growth_percentage}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Month over month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Run Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(annualRunRate)}
              </div>
              <p className="text-xs text-muted-foreground">
                Projected annual revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New MRR This Week</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats ? formatCurrency(weeklyStats.current_week_new_mrr) : formatCurrency(0)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {weeklyStats?.new_subscribers_this_week || 0} new subscribers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
              {weeklyStats && weeklyStats.week_growth_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${weeklyStats && weeklyStats.week_growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {weeklyStats ? `${weeklyStats.week_growth_percentage >= 0 ? '+' : ''}${weeklyStats.week_growth_percentage}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Week over week new MRR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn This Week</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats?.churned_this_week || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Cancelled subscriptions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenueAnalytics;