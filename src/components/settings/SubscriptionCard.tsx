
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, ExternalLink, RefreshCw, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionCard: React.FC = () => {
  const { 
    subscription, 
    usage, 
    loading, 
    subscriptionError,
    checkSubscription, 
    openCustomerPortal 
  } = useSubscription();

  const handleRefresh = () => {
    checkSubscription();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription & Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSubscribed = subscription?.subscribed;
  const currentPlan = subscription?.subscription_tier || 'Free Trial';
  const usagePercentage = usage?.percentage || 0;
  const isNearLimit = usagePercentage >= 80;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription & Credits
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Error Alert */}
          {subscriptionError && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-900">Subscription Status Unavailable</p>
                  <p className="text-xs text-orange-700 mt-1">
                    Unable to retrieve subscription information. Some data may be incomplete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Plan */}
          <div>
            <label className="text-sm font-medium text-gray-700">Current Plan</label>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-gray-900 font-semibold">{currentPlan}</p>
                {subscription?.subscription_end && (
                  <p className="text-sm text-gray-600">
                    Renews on {formatDate(subscription.subscription_end)}
                  </p>
                )}
                {subscriptionError && (
                  <p className="text-sm text-orange-600">
                    Status information unavailable
                  </p>
                )}
              </div>
              {isSubscribed && !subscriptionError && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
              {subscriptionError && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Unknown
                </span>
              )}
            </div>
          </div>

          {/* Billing Cycle Info */}
          {subscription?.next_reset_date && (
            <div>
              <label className="text-sm font-medium text-gray-700">Billing Cycle</label>
              <div className="mt-1 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Next Reset: {formatDate(subscription.next_reset_date)}
                    </p>
                    {subscription.days_remaining !== undefined && (
                      <p className="text-xs text-blue-600">
                        {subscription.days_remaining} days remaining in current period
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage Progress */}
          {usage && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Current Period Usage
                </label>
                <span className="text-sm text-gray-600">
                  {usage.submissions_used} / {usage.total_limit} submissions
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`w-full h-2 ${isNearLimit ? 'bg-red-100' : 'bg-gray-100'}`}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Plan: {usage.limit}</span>
                {usage.purchased_submissions > 0 && <span>Purchased: +{usage.purchased_submissions}</span>}
              </div>
              {isNearLimit && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ You're approaching your billing period limit
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isSubscribed || currentPlan === 'Free Trial' ? (
              <Link to="/pricing">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upgrade Plan
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                onClick={openCustomerPortal}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            )}
            
            <div className="flex gap-2">
              <Link to="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">
                  View All Plans
                </Button>
              </Link>
              {isSubscribed && (
                <Button 
                  variant="outline" 
                  onClick={openCustomerPortal}
                  className="flex-1"
                >
                  Billing History
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
