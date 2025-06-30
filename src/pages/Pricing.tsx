
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import PricingToggle from "@/components/pricing/PricingToggle";
import PlanCard from "@/components/pricing/PlanCard";
import InstitutionalPlan from "@/components/pricing/InstitutionalPlan";
import CouponInput from "@/components/pricing/CouponInput";
import { comparePlans } from "@/utils/planHierarchy";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, subscription } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<any>(null);

  const plans = [
    {
      name: "Free Trial",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Try before you buy",
      tagline: "Perfect for testing out our platform with a small batch of assignments.",
      features: [
        "10 graded submissions",
        "AI-powered grading", 
        "Canvas LMS integration",
        "PDF & Word document support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Lite Plan",
      monthlyPrice: 9.00,
      yearlyPrice: 90.00,
      description: "For individual educators",
      tagline: "Ideal for teachers with a moderate grading workload.",
      features: [
        "250 graded submissions per month",
        "AI-powered grading",
        "Canvas LMS integration", 
        "PDF & Word document support",
        "Email support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Core Plan",
      monthlyPrice: 19.00,
      yearlyPrice: 190.00,
      description: "For dedicated educators",
      tagline: "Perfect for educators with multiple classes and regular grading needs.",
      features: [
        "750 graded submissions per month",
        "AI-powered grading",
        "Canvas LMS integration",
        "PDF, Word & text document support",
        "Priority email support",
        "Customizable feedback templates"
      ],
      buttonText: "Get Started",
      popular: true
    },
    {
      name: "Full-Time Plan", 
      monthlyPrice: 59.00,
      yearlyPrice: 590.00,
      description: "Unlimited grading for professional educators",
      tagline: "Perfect for educators with extensive grading responsibilities who need unlimited submissions.",
      features: [
        "Unlimited graded submissions per month",
        "AI-powered grading",
        "Canvas LMS integration",
        "PDF, Word & text document support",
        "Advanced analytics",
        "Priority support",
        "Customizable feedback templates",
        "Dedicated account manager",
        "Custom AI training"
      ],
      buttonText: "Get Started",
      popular: false
    }
  ];

  const handlePlanSelection = (plan: any) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (plan.name === "Free Trial") {
      navigate("/canvas-setup");
      return;
    }

    createCheckout(plan.name, plan.monthlyPrice, plan.yearlyPrice, isYearly, appliedCoupon);
  };

  const handleCouponApplied = (couponCode: string, discount: any) => {
    setAppliedCoupon(couponCode);
    setCouponDiscount(discount);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
    setCouponDiscount(null);
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.subscription_tier === planName;
  };

  const getPlanComparison = (planName: string) => {
    const currentPlan = subscription?.subscription_tier || 'Free Trial';
    return comparePlans(currentPlan, planName);
  };

  const getDiscountedPrice = (originalPrice: number) => {
    if (!couponDiscount) return originalPrice;
    
    if (couponDiscount.percent_off) {
      return originalPrice * (1 - couponDiscount.percent_off / 100);
    }
    
    if (couponDiscount.amount_off) {
      return Math.max(0, originalPrice - (couponDiscount.amount_off / 100));
    }
    
    return originalPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />

          <CouponInput
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
            appliedCoupon={appliedCoupon}
            isYearly={isYearly}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {plans.map((plan, index) => (
              <PlanCard
                key={index}
                plan={{
                  ...plan,
                  monthlyPrice: getDiscountedPrice(plan.monthlyPrice),
                  yearlyPrice: getDiscountedPrice(plan.yearlyPrice),
                }}
                originalPlan={plan}
                isYearly={isYearly}
                onSelect={handlePlanSelection}
                isCurrentPlan={isCurrentPlan(plan.name)}
                planComparison={getPlanComparison(plan.name)}
                appliedCoupon={appliedCoupon}
                couponDiscount={couponDiscount}
              />
            ))}
          </div>

          <InstitutionalPlan />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
