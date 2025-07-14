
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/82237aca-ea13-4bc4-b27b-75d688d97a7f.png" 
                  alt="A.L.L.E.N. Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold">A.L.L.E.N.</span>
            </div>
            <p className="text-gray-400">AI Learning Led Evaluation & Navigation</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/ai-pedagogy" className="text-gray-400 hover:text-white">AI Literacy</Link></li>
              <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/canvas-setup" className="text-gray-400 hover:text-white">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              A.L.L.E.N. is not affiliated with, endorsed by, or sponsored by Instructure, Inc. or Canvas LMS. 
              Canvas is a trademark of Instructure, Inc. This is an independent third-party application that integrates with Canvas through public APIs.
            </p>
          </div>
          <div className="text-center text-gray-400">
            <p>© 2025 A.L.L.E.N. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
