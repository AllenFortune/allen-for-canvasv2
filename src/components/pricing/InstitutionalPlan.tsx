
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstitutionalPlan: React.FC = () => {
  const navigate = useNavigate();

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

  const handleInquiryClick = () => {
    navigate('/institutional-inquiry');
  };

  return (
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
            onClick={handleInquiryClick}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Request Custom Quote
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Get a personalized quote within 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionalPlan;
