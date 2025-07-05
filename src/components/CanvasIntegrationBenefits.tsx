import React from 'react';
import { CheckCircle, Zap, Shield, Users } from 'lucide-react';

const CanvasIntegrationBenefits = () => {
  const benefits = [
    {
      icon: CheckCircle,
      title: "No Copy-Paste Workflow",
      description: "Access assignments, rubrics, and student submissions directly within A.L.L.E.N.—no more toggling between platforms or copying content manually."
    },
    {
      icon: Zap,
      title: "One-Click Grade Delivery",
      description: "Review AI suggestions and deliver grades plus feedback directly to Canvas gradebook with a single click. Students see results instantly."
    },
    {
      icon: Shield,
      title: "Canvas API Compliant",
      description: "Built with Canvas API best practices and security standards. Your data stays secure while enabling powerful AI-assisted workflows."
    },
    {
      icon: Users,
      title: "Student AI Literacy Integration",
      description: "Transform existing assignments into AI literacy learning opportunities. Help students become responsible AI collaborators, not just users."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built for Canvas Educators
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stop fighting disconnected tools. A.L.L.E.N. integrates seamlessly with your Canvas workflow, 
            giving you the power to lead AI adoption on your campus.
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
              Lead AI Innovation at Your Institution
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Instead of banning AI or struggling with compliance, become the educator who shows colleagues 
              how to integrate AI responsibly. A.L.L.E.N. gives you the tools to model best practices.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">Increase Student Engagement</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Model Responsible AI Use</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Save Grading Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CanvasIntegrationBenefits;