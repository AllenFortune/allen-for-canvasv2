
const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Connect Canvas Seamlessly",
      description: "Securely link your Canvas LMS with one-time setup. A.L.L.E.N. automatically syncs with your courses, assignments, and student submissions—no copy-paste required.",
      icon: "🔗"
    },
    {
      number: "2", 
      title: "AI Reviews & Suggests",
      description: "Our AI analyzes student work against your rubrics and course context, providing intelligent feedback suggestions alongside each submission in your familiar Canvas workflow.",
      icon: "📝"
    },
    {
      number: "3",
      title: "One-Click Grade Delivery",
      description: "Review AI suggestions, make adjustments, and deliver grades plus feedback directly to Canvas with a single click. Transform students into AI-literate learners while you lead.",
      icon: "/lovable-uploads/82237aca-ea13-4bc4-b27b-75d688d97a7f.png"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Canvas-Native AI Integration
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience seamless AI-powered grading without leaving your Canvas workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{step.number}</span>
                </div>
                <div className="text-4xl mb-4 flex items-center justify-center h-14">
                  {step.icon.startsWith('/') ? (
                    <img 
                      src={step.icon} 
                      alt="A.L.L.E.N. Logo" 
                      className="w-14 h-14 object-contain"
                    />
                  ) : (
                    <span className="leading-none">{step.icon}</span>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
