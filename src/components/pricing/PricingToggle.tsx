
import React from 'react';
import { Switch } from "@/components/ui/switch";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, onToggle }) => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Choose Your Plan
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Find the perfect plan for your grading needs
      </p>
      
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-indigo-600"
        />
        <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Yearly
        </span>
      </div>
      {isYearly && (
        <p className="text-sm text-green-600 font-medium">
          Save 2 months with yearly billing! 🎉
        </p>
      )}
    </div>
  );
};

export default PricingToggle;
