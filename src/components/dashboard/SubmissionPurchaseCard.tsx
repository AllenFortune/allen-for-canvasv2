
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, CreditCard, AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const SubmissionPurchaseCard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    usage,
    subscription,
    loading,
    subscriptionError,
    purchaseAdditionalSubmissions,
    checkSubscription
  } = useSubscription();

  // Handle purchase success from URL parameters
  useEffect(() => {
    const purchaseStatus = searchParams.get('purchase');
    if (purchaseStatus === 'success') {
      toast({
        title: "Purchase Successful!",
        description: "Your additional submissions have been added.",
      });
      // Remove the parameter from URL
      setSearchParams(prev => {
        prev.delete('purchase');
        return prev;
      });
      // Refresh subscription data
      checkSubscription();
    } else if (purchaseStatus === 'cancelled') {
      toast({
        title: "Purchase Cancelled",
        description: "Your purchase was cancelled.",
        variant: "destructive",
      });
      // Remove the parameter from URL
      setSearchParams(prev => {
        prev.delete('purchase');
        return prev;
      });
    }
  }, [searchParams, setSearchParams, checkSubscription]);

  const handleManualRefresh = async () => {
    await checkSubscription();
    toast({
      title: "Refreshed",
      description: "Subscription and usage data updated.",
    });
  };

  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Billing Period Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>;
  }

  // Show fallback if subscription failed but we still have usage data
  if (subscriptionError && !usage) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Billing Period Usage
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Subscription Status Unavailable</p>
              <p>Unable to load subscription information. Your usage data may be incomplete. Click "Retry" to try again.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const isUnlimited = usage.total_limit === -1;
  const isNearLimit = !isUnlimited && usage.percentage >= 80;
  const isAtLimit = !isUnlimited && usage.submissions_used >= usage.total_limit;
  
  // Format next reset date
  const formatResetDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return <Card className={isNearLimit ? 'border-orange-200 bg-orange-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Billing Period Usage
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Horizontal Layout for larger screens */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:items-start">
          {/* Left Section: Billing Cycle Info and Usage */}
          <div className="lg:col-span-2 space-y-4">
            {/* Billing Cycle Info or Error Alert */}
            {subscriptionError ? (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-900">
                    Subscription info unavailable - usage data may be incomplete
                  </span>
                </div>
              </div>
            ) : subscription?.next_reset_date ? (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Next Reset: {formatResetDate(subscription.next_reset_date)}
                    </span>
                  </div>
                  {subscription.days_remaining !== undefined && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {subscription.days_remaining} days left
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Usage Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Submissions Used
                </span>
                <span className="text-sm text-gray-600">
                  {usage.submissions_used} / {isUnlimited ? 'Unlimited' : usage.total_limit}
                </span>
              </div>
              {!isUnlimited && <Progress value={usage.percentage} className={`w-full h-3 ${isNearLimit ? 'bg-orange-100' : 'bg-gray-100'}`} />}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Plan: {usage.limit}</span>
                {usage.purchased_submissions > 0 && <span>Purchased: +{usage.purchased_submissions}</span>}
              </div>
            </div>

            {/* Warning or Status */}
            {isUnlimited ? <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-800">Unlimited Plan</p>
                <p>You have unlimited submissions with your Full-Time Plan.</p>
              </div> : isAtLimit ? <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Limit Reached</p>
                  <p>You've used all {usage.total_limit} submissions for this billing period. Purchase more to continue grading.</p>
                </div>
              </div> : isNearLimit ? <div className="flex items-start gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Approaching Limit</p>
                  <p>You're using {Math.round(usage.percentage)}% of your billing period submissions.</p>
                </div>
              </div> : <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-800">You're all set!</p>
                <p>You have {usage.total_limit - usage.submissions_used} submissions remaining in this billing period.</p>
              </div>}
          </div>

          {/* Right Section: Purchase Button */}
          {!isUnlimited && (
            <div className="lg:col-span-1">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 h-full flex flex-col justify-center">
                <div className="text-center mb-3">
                  <h4 className="font-semibold text-blue-900">Need More Submissions?</h4>
                  <p className="text-sm text-blue-700 mb-2">Get 100 additional submissions for this billing period</p>
                  <div className="text-2xl font-bold text-blue-900">$5</div>
                  <div className="text-xs text-blue-600">$0.05 per submission</div>
                </div>
                <Button onClick={purchaseAdditionalSubmissions} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy 100 More Submissions
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>;
};

export default SubmissionPurchaseCard;
