
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Subscription & Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Plan</label>
            <p className="text-gray-900">Free Trial</p>
            <p className="text-sm text-gray-600">10 graded submissions remaining</p>
          </div>
          
          {/* Recommended Upgrade */}
          <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Recommended Upgrade</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Best Value
              </span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Lite Plan</h4>
            <p className="text-sm text-gray-600 mb-3">
              Get 25x more graded submissions per month plus email support.
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900">$8.99</span>
                  <span className="text-gray-500 line-through">$9.99</span>
                  <span className="text-green-600 text-sm">10% off</span>
                </div>
                <p className="text-sm text-gray-600">250 graded submissions/month</p>
                <p className="text-xs text-gray-500">vs. your current 10 submissions</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Upgrade Now
              </Button>
            </div>
          </div>

          {/* Add-on Pack */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">Add-on Pack</h3>
            <p className="text-sm text-gray-600 mb-3">Need more graded submissions? Add them to any plan.</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-gray-900">$4.94</span>
                <span className="text-gray-500 line-through ml-2">$5.49</span>
                <span className="text-green-600 text-sm ml-2">10% off</span>
                <p className="text-sm text-gray-600">100 additional graded submissions</p>
              </div>
              <Button className="bg-gray-900 hover:bg-gray-800">
                Add to Your Plan
              </Button>
            </div>
          </div>

          <div className="pt-4">
            <Link to="/pricing">
              <Button variant="outline" className="mr-4">
                View All Plans
              </Button>
            </Link>
            <Button variant="outline">
              Billing History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
