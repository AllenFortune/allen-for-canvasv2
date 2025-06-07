
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
          Transform your Canvas classroom with AI literacy integration. Grade smarter, teach students 
          to collaborate with AI effectively, and prepare them for an AI-enhanced future.
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
            onClick={() => navigate("/ai-literacy")}
          >
            Explore AI Literacy
          </Button>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
          No credit card required • 10 free submissions
        </p>
        
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 mb-12">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            AI-Enhanced Grading
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Student AI Literacy
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Teacher Resources
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">See A.L.L.E.N. in Action</h3>
            <p className="text-gray-600">Watch our complete walkthrough of AI-powered Canvas integration</p>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <div style={{position: 'relative', paddingBottom: '49.583333333333336%', height: 0}}>
              <iframe 
                src="https://www.loom.com/embed/b58e714b7b45424285f5f46948474261?sid=4ff56994-fedf-4f81-8452-9674547f92aa" 
                frameBorder="0" 
                webkitallowfullscreen="true" 
                mozallowfullscreen="true" 
                allowFullScreen 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
                title="A.L.L.E.N. Demo Walkthrough"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
