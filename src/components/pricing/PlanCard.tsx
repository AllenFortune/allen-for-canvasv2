
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getPlanButtonText } from "@/utils/planHierarchy";

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  tagline?: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

interface PlanCardProps {
  plan: Plan;
  originalPlan?: Plan;
  isYearly: boolean;
  onSelect: (plan: Plan) => void;
  isCurrentPlan: boolean;
  planComparison?: 'current' | 'upgrade' | 'downgrade';
  appliedCoupon?: string | null;
  couponDiscount?: any;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  originalPlan,
  isYearly, 
  onSelect, 
  isCurrentPlan, 
  planComparison = 'upgrade',
  appliedCoupon,
  couponDiscount
}) => {
  const getDisplayPrice = () => {
    if (plan.monthlyPrice === 0) return "$0.00";
    
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getOriginalPrice = () => {
    if (!originalPlan || !couponDiscount || plan.monthlyPrice === 0) return null;
    
    const originalPrice = isYearly ? originalPlan.yearlyPrice : originalPlan.monthlyPrice;
    return `$${originalPrice.toFixed(2)}`;
  };

  const getPeriod = () => {
    return isYearly ? "/year" : "/month";
  };

  const getSavings = () => {
    if (!isYearly || plan.monthlyPrice === 0) return null;
    
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    
    return `Save $${savings.toFixed(2)}`;
  };

  const buttonText = getPlanButtonText(planComparison, plan.buttonText);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      plan.popular ? 'border-indigo-200 relative ring-2 ring-indigo-100' : 
      isCurrentPlan ? 'border-green-200 ring-2 ring-green-100' : 
      'border-gray-200'
    } p-8`}>
      {plan.popular && !isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            Current Plan
          </span>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline mb-2">
          {getOriginalPrice() && (
            <span className="text-2xl text-gray-400 line-through mr-2">{getOriginalPrice()}</span>
          )}
          <span className="text-4xl font-bold text-gray-900">{getDisplayPrice()}</span>
          <span className="text-gray-600 ml-1">{getPeriod()}</span>
        </div>
        {appliedCoupon && couponDiscount && plan.monthlyPrice > 0 && (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
            {couponDiscount.percent_off && `${couponDiscount.percent_off}% off with ${appliedCoupon}`}
          </div>
        )}
        {getSavings() && (
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
            {getSavings()}
          </div>
        )}
        <p className="text-gray-600 mb-4">{plan.description}</p>
        {plan.tagline && (
          <p className="text-sm text-gray-500">{plan.tagline}</p>
        )}
      </div>

      <div className="mb-8">
        <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
        <ul className="space-y-3">
          {plan.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-center">
              <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button 
        className={`w-full ${
          isCurrentPlan 
            ? 'bg-green-600 hover:bg-green-700' 
            : planComparison === 'upgrade'
            ? 'bg-gray-900 hover:bg-gray-800'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        onClick={() => onSelect(originalPlan || plan)}
        disabled={isCurrentPlan}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default PlanCard;
