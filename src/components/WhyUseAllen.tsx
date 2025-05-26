
import { CheckCircle, Clock, BookOpen, MessageSquare, BarChart3, Shield } from "lucide-react";

const WhyUseAllen = () => {
  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-indigo-600" />,
      title: "Save 60% of Grading Time",
      description: "Reduce hours spent on repetitive grading tasks while maintaining quality feedback for your students."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
      title: "Consistent, Quality Feedback",
      description: "Ensure every student receives detailed, constructive feedback that helps them improve their work."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "Rubric-Based Grading",
      description: "AI follows your existing rubrics to provide accurate, standardized grading across all submissions."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-indigo-600" />,
      title: "Focus on Teaching",
      description: "Spend less time on administrative tasks and more time on what you love - educating students."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Advanced Analytics",
      description: "Get insights into class performance and identify areas where students need additional support."
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never store student submissions permanently."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Teachers Choose A.L.L.E.N.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save time, improve consistency, and enhance your teaching experience
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                {benefit.icon}
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  {benefit.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUseAllen;
