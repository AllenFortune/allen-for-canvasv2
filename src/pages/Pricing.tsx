
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Pricing = () => {
  const navigate = useNavigate();
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
      monthlyPrice: 8.99,
      yearlyPrice: 89.90,
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
      monthlyPrice: 17.99,
      yearlyPrice: 179.90,
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
      monthlyPrice: 53.99,
      yearlyPrice: 539.90,
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
      monthlyPrice: 89.99,
      yearlyPrice: 899.90,
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

  const institutionalPlan = {
    name: "Institutional Plan",
    description: "For schools, districts, and large organizations",
    tagline: "Comprehensive solution for educational institutions with multiple educators.",
    features: [
      "Unlimited graded submissions",
      "Multiple teacher accounts",
      "Admin dashboard & analytics",
      "White-label option",
      "Training & onboarding",
      "Dedicated account manager",
      "Custom integrations",
      "Priority support & SLA"
    ]
  };

  const getDisplayPrice = (plan: any) => {
    if (plan.monthlyPrice === 0) return "$0.00";
    
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    return `$${price.toFixed(2)}`;
  };

  const getPeriod = () => {
    return isYearly ? "/year" : "/month";
  };

  const getSavings = (plan: any) => {
    if (!isYearly || plan.monthlyPrice === 0) return null;
    
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    
    return `Save $${savings.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
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
                onCheckedChange={setIsYearly}
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

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.slice(0, 3).map((plan, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-sm border ${plan.popular ? 'border-indigo-200 relative ring-2 ring-indigo-100' : 'border-gray-200'} p-8`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">{getDisplayPrice(plan)}</span>
                    <span className="text-gray-600 ml-1">{getPeriod()}</span>
                  </div>
                  {getSavings(plan) && (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                      {getSavings(plan)}
                    </div>
                  )}
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <p className="text-sm text-gray-500">{plan.tagline}</p>
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
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => navigate("/canvas-setup")}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {plans.slice(3).map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">{getDisplayPrice(plan)}</span>
                    <span className="text-gray-600 ml-1">{getPeriod()}</span>
                  </div>
                  {getSavings(plan) && (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                      {getSavings(plan)}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => navigate("/canvas-setup")}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>

          {/* Institutional Plan */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border-2 border-indigo-200 p-8 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-4">
                For Institutions
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{institutionalPlan.name}</h3>
              <p className="text-xl text-gray-600 mb-4">{institutionalPlan.description}</p>
              <p className="text-gray-600 mb-8">{institutionalPlan.tagline}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
                {institutionalPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">Custom Pricing</div>
                <p className="text-gray-600 mb-6">
                  Tailored solutions for your institution's needs and budget
                </p>
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg"
                  onClick={() => window.location.href = 'mailto:sales@allen-ai.com?subject=Institutional Plan Inquiry'}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Contact for Pricing
                </Button>
                <p className="text-sm text-gray-500 mt-3">
                  Get a custom quote within 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
