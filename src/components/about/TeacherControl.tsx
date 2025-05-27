
import React from 'react';
import { Settings, Target, BookOpen, ClipboardCheck } from 'lucide-react';

const TeacherControl = () => {
  const features = [
    {
      icon: Settings,
      title: "Customizable Feedback",
      description: "Emphasize specific learning outcomes, objectives, or criteria that matter most to your teaching goals."
    },
    {
      icon: Target,
      title: "Formative & Summative Options",
      description: "Choose whether feedback should be formative (growth-focused) or summative (evaluative) based on your needs."
    },
    {
      icon: ClipboardCheck,
      title: "Rubric Integration",
      description: "Grade using your existing rubrics or assignment instructions—A.L.L.E.N. adapts to your grading style."
    },
    {
      icon: BookOpen,
      title: "Personal Teaching Style",
      description: "Customize the AI to match your communication style and feedback preferences for consistency."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Teacher Control & Customization
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A.L.L.E.N. adapts to your teaching style, not the other way around. Every aspect 
            can be customized to fit your classroom needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherControl;
