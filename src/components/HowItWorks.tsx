
const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Connect Canvas Account",
      description: "Securely link your Canvas LMS using your institution's API token. We'll guide you through the simple setup process.",
      icon: "🔗"
    },
    {
      number: "2", 
      title: "Select Assignments",
      description: "Choose which assignments you want AI assistance with. A.L.L.E.N. works with essays, projects, and any text-based submissions.",
      icon: "📝"
    },
    {
      number: "3",
      title: "Get AI Grading Assistance",
      description: "Our AI analyzes submissions against your rubrics and provides suggested grades and detailed feedback to enhance your evaluation process.",
      icon: "🤖"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How A.L.L.E.N. Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started with AI-powered grading in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{step.number}</span>
                </div>
                <div className="text-4xl mb-4">{step.icon}</div>
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
