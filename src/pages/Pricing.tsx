
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import PricingToggle from "@/components/pricing/PricingToggle";
import PlanCard from "@/components/pricing/PlanCard";
import InstitutionalPlan from "@/components/pricing/InstitutionalPlan";
import { comparePlans } from "@/utils/planHierarchy";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout, subscription } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);

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
      monthlyPrice: 9.99,
      yearlyPrice: 99.90,
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
      monthlyPrice: 19.99,
      yearlyPrice: 199.90,
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
      monthlyPrice: 69.99,
      yearlyPrice: 699.90,
      description: "Designed for educators with heavy grading responsibilities.",
      features: [
        "2,000 graded submissions per month",
        "All Core Plan features",
        "Advanced analytics",
        "Priority support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Super Plan",
      monthlyPrice: 99.99,
      yearlyPrice: 999.90,
      description: "Our most comprehensive plan for educators with extensive grading needs.",
      features: [
        "3,000 graded submissions per month",
        "All Full-Time Plan features", 
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

    createCheckout(plan.name, plan.monthlyPrice, plan.yearlyPrice, isYearly);
  };

  const isCurrentPlan = (planName: string) => {
    return subscription?.subscription_tier === planName;
  };

  const getPlanComparison = (planName: string) => {
    const currentPlan = subscription?.subscription_tier || 'Free Trial';
    return comparePlans(currentPlan, planName);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.slice(0, 3).map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isYearly={isYearly}
                onSelect={handlePlanSelection}
                isCurrentPlan={isCurrentPlan(plan.name)}
                planComparison={getPlanComparison(plan.name)}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {plans.slice(3).map((plan, index) => (
              <PlanCard
                key={index}
                plan={plan}
                isYearly={isYearly}
                onSelect={handlePlanSelection}
                isCurrentPlan={isCurrentPlan(plan.name)}
                planComparison={getPlanComparison(plan.name)}
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
