
import { CheckCircle, Clock, BookOpen, MessageSquare, BarChart3, Shield, Users, Target, TrendingUp } from "lucide-react";

const WhyUseAllen = () => {
  const benefits = [
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Lead AI Innovation on Campus",
      description: "Stop being the faculty member who bans AI. Become the educator who shows colleagues how to integrate it responsibly and effectively."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Transform Student Engagement",
      description: "Students are more motivated when they learn to collaborate with AI rather than hide their usage. Create transparent, educational AI experiences."
    },
    {
      icon: <Target className="w-8 h-8 text-blue-600" />,
      title: "Model AI Best Practices",
      description: "Demonstrate responsible AI use in your classroom. Students learn ethical AI collaboration by watching your teaching workflow."
    },
    {
      icon: <Clock className="w-8 h-8 text-purple-600" />,
      title: "Save Time, Improve Feedback",
      description: "Focus on high-level pedagogical decisions while AI handles routine tasks. Spend more time on what matters: student learning."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-orange-600" />,
      title: "Prepare Students for AI Careers",
      description: "Every industry will use AI. Give your students hands-on experience with AI collaboration in an academic context."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Canvas-Native Security",
      description: "Built with Canvas API compliance and institutional security standards. Your data stays within approved systems."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Educators Choose A.L.L.E.N.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform from AI skeptic to AI leader. Model responsible AI use while improving 
            student engagement and saving valuable time.
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
