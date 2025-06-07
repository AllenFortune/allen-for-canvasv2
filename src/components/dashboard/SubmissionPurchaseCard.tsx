import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, CreditCard, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
const SubmissionPurchaseCard: React.FC = () => {
  const {
    usage,
    loading,
    purchaseAdditionalSubmissions
  } = useSubscription();
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Monthly Usage
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
  if (!usage) {
    return null;
  }
  const isNearLimit = usage.percentage >= 80;
  const isAtLimit = usage.submissions_used >= usage.total_limit;
  return <Card className={isNearLimit ? 'border-orange-200 bg-orange-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Monthly Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Submissions Used
              </span>
              <span className="text-sm text-gray-600">
                {usage.submissions_used} / {usage.total_limit}
              </span>
            </div>
            <Progress value={usage.percentage} className={`w-full h-2 ${isNearLimit ? 'bg-orange-100' : 'bg-gray-100'}`} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Plan: {usage.limit}</span>
              {usage.purchased_submissions > 0 && <span>Purchased: +{usage.purchased_submissions}</span>}
            </div>
          </div>

          {/* Warning or Status */}
          {isAtLimit ? <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Limit Reached</p>
                <p>You've used all {usage.total_limit} submissions this month. Purchase more to continue grading.</p>
              </div>
            </div> : isNearLimit ? <div className="flex items-start gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Approaching Limit</p>
                <p>You're using {Math.round(usage.percentage)}% of your monthly submissions.</p>
              </div>
            </div> : <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800">You're all set!</p>
              <p>You have {usage.total_limit - usage.submissions_used} submissions remaining this month.</p>
            </div>}

          {/* Purchase Button */}
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-blue-900">Have More Submissions to Grade?</h4>
                  <p className="text-sm text-blue-700">Get 100 additional submissions instantly</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">$5</div>
                  <div className="text-xs text-blue-600">$0.05 per submission</div>
                </div>
              </div>
              <Button onClick={purchaseAdditionalSubmissions} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Buy 100 More Submissions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default SubmissionPurchaseCard;