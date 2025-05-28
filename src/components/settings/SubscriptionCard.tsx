
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionCard: React.FC = () => {
  const { 
    subscription, 
    usage, 
    loading, 
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
          {/* Current Plan */}
          <div>
            <label className="text-sm font-medium text-gray-700">Current Plan</label>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-gray-900 font-semibold">{currentPlan}</p>
                {subscription?.subscription_end && (
                  <p className="text-sm text-gray-600">
                    Renews on {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
              {isSubscribed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Usage Progress */}
          {usage && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Monthly Usage
                </label>
                <span className="text-sm text-gray-600">
                  {usage.submissions_used} / {usage.limit} submissions
                </span>
              </div>
              <Progress 
                value={usagePercentage} 
                className={`w-full h-2 ${isNearLimit ? 'bg-red-100' : 'bg-gray-100'}`}
              />
              {isNearLimit && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ You're approaching your monthly limit
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
