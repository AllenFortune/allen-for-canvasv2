
import { CheckCircle, Clock, BookOpen, MessageSquare, BarChart3, Shield, Users, Target, TrendingUp } from "lucide-react";

const WhyUseAllen = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Focus on What Only Teachers Can Do",
      description: "Stop grading. Start facilitating critical thinking, leading meaningful discussions, guiding creative problem-solving, and nurturing the analytical skills only humans can develop."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Model AI as Thinking Partner",
      description: "Show students how to use AI to scaffold their understanding, not replace their thinking. Demonstrate collaboration where AI amplifies human insight rather than substituting for it."
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Create Engaged AI Learners",
      description: "Transform students from passive AI consumers to active AI collaborators. Guide them to analyze, question, and build upon AI-generated content rather than accepting it uncritically."
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Transform Assignments into AI Literacy Labs",
      description: "Every assignment becomes an opportunity to teach responsible AI use. Guide students to discover information, analyze sources, and apply knowledge with AI as their thinking partner."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-orange-600" />,
      title: "Guide Discovery, Don't Deliver Information",
      description: "Your role has evolved from information provider to learning facilitator. Help students navigate, understand, and critically evaluate the vast information landscape of the internet age."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Canvas-Native Integration",
      description: "Seamlessly integrated with your existing Canvas workflow. Secure, compliant, and designed to enhance rather than replace your teaching practices."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Reclaim Your Role as a Learning Guide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            In the age of AI and internet, your role isn't to provide information—it's to guide thinking. 
            ALLEN frees you to focus on what only teachers can do.
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
