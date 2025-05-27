
import React from 'react';
import { Clock, BarChart3, Heart, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TeacherBenefits = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Clock,
      title: "Save 60% of Grading Time",
      description: "Spend less time on initial evaluation and more time on meaningful feedback and instruction.",
      stat: "Average 40 minutes saved per assignment set"
    },
    {
      icon: BarChart3,
      title: "More Consistent Grading",
      description: "AI-assisted evaluation helps maintain consistent standards across all student submissions.",
      stat: "Reduced grading variance by 35%"
    },
    {
      icon: Heart,
      title: "Reduced Grading Fatigue",
      description: "Start with AI suggestions instead of blank pages, making grading less mentally exhausting.",
      stat: "Teachers report 50% less grading stress"
    },
    {
      icon: Focus,
      title: "Focus on What Matters",
      description: "Spend your energy on high-level feedback and student support rather than mechanical evaluation.",
      stat: "More time for personalized teaching"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real Benefits for Real Teachers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A.L.L.E.N. helps teachers focus on what they do best—teaching and connecting with students.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {benefit.description}
              </p>
              <p className="text-sm font-medium text-indigo-600">
                {benefit.stat}
              </p>
            </div>
          ))}
        </div>
        
        <div className="bg-indigo-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Transform Your Grading Experience?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of educators who are saving time and providing better feedback 
            with A.L.L.E.N.'s AI-assisted grading tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/canvas-setup")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/features")}
            >
              Explore Features
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherBenefits;
