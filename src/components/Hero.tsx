
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroBackground from "@/assets/hero-background.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 hero-gradient-bg opacity-10"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-full hero-float hero-pulse"></div>
      <div className="absolute top-32 right-20 w-12 h-12 bg-blue-500/20 rounded-lg hero-float-delayed"></div>
      <div className="absolute bottom-32 left-20 w-8 h-8 bg-purple-500/30 rounded-full hero-float"></div>
      <div className="absolute bottom-20 right-10 w-6 h-6 bg-indigo-400/25 rounded-lg hero-float-delayed hero-pulse"></div>
      
      {/* Data Flow Lines */}
      <div className="absolute top-1/4 left-1/4 w-px h-20 bg-gradient-to-b from-primary/30 to-transparent hero-data-flow"></div>
      <div className="absolute top-1/3 right-1/3 w-px h-16 bg-gradient-to-b from-blue-500/30 to-transparent hero-data-flow" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Stop Being the AI Police.<br />
          <span className="text-indigo-600">Be the AI Leader.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
          Transform your Canvas classroom with seamless AI integration. No more copy-paste workflows—
          review AI-suggested feedback alongside student submissions and deliver grades with one click.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3"
            onClick={() => navigate("/canvas-setup")}
          >
            Become an AI Leader
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3"
            onClick={() => navigate("/ai-literacy")}
          >
            Explore AI Literacy Tools
          </Button>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">
          No credit card required • Canvas integration in minutes
        </p>
        
        <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 mb-12">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Canvas-Native Integration
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            AI Leadership Tools
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Student Engagement
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">See A.L.L.E.N. in Action</h3>
            <p className="text-gray-600">Watch a quick walkthrough of A.L.L.E.N.'s AI Assisted Grading</p>
          </div>
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <div style={{position: 'relative', paddingBottom: '49.583333333333336%', height: 0}}>
              <iframe 
                src="https://www.loom.com/embed/b58e714b7b45424285f5f46948474261?sid=4ff56994-fedf-4f81-8452-9674547f92aa" 
                frameBorder="0" 
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
