import React from 'react';
import { CheckCircle, Zap, Shield, Users } from 'lucide-react';

const CanvasIntegrationBenefits = () => {
  const benefits = [
    {
      icon: CheckCircle,
      title: "Time Liberation for Higher-Order Teaching",
      description: "Eliminate hours of grading drudgery. Access assignments and submissions directly within ALLEN, freeing your time for facilitating critical thinking and meaningful student interactions."
    },
    {
      icon: Zap,
      title: "Consistent Feedback, Human Wisdom",
      description: "AI provides comprehensive, consistent feedback while you focus on guiding student analysis, fostering discussion, and modeling how to think critically about AI-generated content."
    },
    {
      icon: Shield,
      title: "Seamless Canvas Integration",
      description: "Works within your existing Canvas workflow. No learning curve, no data migration—just enhanced capability to focus on what teachers do best."
    },
    {
      icon: Users,
      title: "Every Assignment as AI Literacy Lab",
      description: "Transform routine assignments into opportunities to teach responsible AI collaboration. Guide students to use AI as a thinking partner, not a replacement for thought."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Teacher's Role is Evolving
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            In the age of AI and internet, students don't need you to provide information—they need you to guide their thinking. 
            ALLEN's Canvas integration frees you to focus on analysis, discussion, application, and critical thinking.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              From Information Provider to Learning Guide
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Your students have access to all the world's information and powerful AI tools. What they need from you is guidance 
              in understanding, analyzing, discussing, and applying that information. ALLEN handles the grading so you can focus on developing minds.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Foster Critical Thinking</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Guide AI Collaboration</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Reclaim Teaching Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CanvasIntegrationBenefits;