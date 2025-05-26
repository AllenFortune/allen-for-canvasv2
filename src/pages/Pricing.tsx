
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free Trial",
      price: "$0.00",
      period: "/month",
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
      price: "$8.99",
      originalPrice: "$9.99",
      period: "/month",
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
      price: "$17.99",
      originalPrice: "$19.99", 
      period: "/month",
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
      price: "$53.99",
      originalPrice: "$59.99",
      period: "/month",
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
      price: "$89.99", 
      originalPrice: "$99.99",
      period: "/month",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Find the perfect plan for your grading needs
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {plans.slice(0, 3).map((plan, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-sm border ${plan.popular ? 'border-indigo-200 relative' : 'border-gray-200'} p-8`}>
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
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">{plan.originalPrice}</span>
                    )}
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
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

          <div className="grid lg:grid-cols-2 gap-8">
            {plans.slice(3).map((plan, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-500 line-through ml-2">{plan.originalPrice}</span>
                    )}
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  </div>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
