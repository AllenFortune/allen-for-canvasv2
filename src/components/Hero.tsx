
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          AI Learning Led Evaluation & Navigation
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
          Transform your Canvas grading experience with intelligent AI assistance. Grade faster, 
          provide better feedback, and focus on what matters most - teaching.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3"
            onClick={() => navigate("/canvas-setup")}
          >
            Start Free Trial
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3"
            onClick={() => navigate("/pricing")}
          >
            View Pricing
          </Button>
        </div>
        
        <p className="text-gray-500 text-sm">
          No credit card required • 10 free submissions
        </p>

        <div className="mt-16 bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">AI</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700">AI-Powered Grading Demo</h3>
              <p className="text-gray-500 mt-2">See A.L.L.E.N. in action</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
