
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, AlertCircle } from "lucide-react";

interface CouponInputProps {
  onCouponApplied: (couponCode: string, discount: any) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
  isYearly: boolean;
}

const CouponInput: React.FC<CouponInputProps> = ({ 
  onCouponApplied, 
  onCouponRemoved, 
  appliedCoupon,
  isYearly 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      // Mock validation - in real implementation, you'd call your backend
      // For now, accept any code that starts with 'SAVE'
      if (couponCode.toUpperCase().startsWith('SAVE')) {
        const mockDiscount = {
          percent_off: 20,
          amount_off: null,
          currency: 'usd'
        };
        onCouponApplied(couponCode, mockDiscount);
        setCouponCode('');
      } else {
        setError('Invalid coupon code');
      }
    } catch (err) {
      setError('Failed to validate coupon');
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Coupon "{appliedCoupon}" applied
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="text-green-700 hover:text-green-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex space-x-2">
        <Input
          placeholder="Enter coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button
          onClick={validateCoupon}
          disabled={!couponCode.trim() || isValidating}
          variant="outline"
        >
          {isValidating ? "Checking..." : "Apply"}
        </Button>
      </div>
      {error && (
        <div className="flex items-center space-x-2 mt-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default CouponInput;
