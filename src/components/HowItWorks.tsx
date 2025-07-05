
const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Connect Canvas, Reclaim Time",
      description: "Securely link your Canvas LMS with one-time setup. ALLEN automatically handles the grading workflow, liberating hours of your time for what matters most—guiding student thinking and fostering deeper learning.",
      icon: "🔗"
    },
    {
      number: "2", 
      title: "AI Provides Feedback, You Provide Wisdom",
      description: "While AI analyzes student work and generates consistent feedback against your rubrics, you focus on facilitating critical thinking, leading discussions, and modeling how to collaborate with AI as a thinking partner.",
      icon: "📝"
    },
    {
      number: "3",
      title: "Students Learn WITH AI, Not FROM AI",
      description: "Deliver comprehensive feedback instantly while demonstrating responsible AI use. Your students see you as their guide in learning to think alongside AI, not just consume AI-generated content.",
      icon: "/lovable-uploads/82237aca-ea13-4bc4-b27b-75d688d97a7f.png"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Teaching Evolves with ALLEN
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform from grading burden to guiding brilliance—seamlessly integrated with your Canvas workflow
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
