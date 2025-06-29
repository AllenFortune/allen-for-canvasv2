
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';

const ReferralPromotionSection = () => {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 rounded-full p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Invite Friends & Earn Rewards</h3>
              <p className="text-gray-600">Get 10 free submissions for each friend who connects Canvas</p>
            </div>
          </div>
          <Link to="/settings?tab=referrals">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Start Referring <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReferralPromotionSection;
