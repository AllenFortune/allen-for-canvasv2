
import React from 'react';
import { User, CheckCircle, Edit3 } from 'lucide-react';

const NotAnAutoGrader = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            This is NOT an Auto Grader
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A.L.L.E.N. is your AI teaching assistant—you remain in complete control of every grade and piece of feedback.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg bg-blue-50">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">You're in Control</h3>
            <p className="text-gray-600">
              Every AI suggestion is just that—a suggestion. You review, edit, and approve 
              all grades and feedback before students see them.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-green-50">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fully Editable</h3>
            <p className="text-gray-600">
              Modify any AI-generated feedback or grade to match your teaching style, 
              student needs, and specific assignment requirements.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-purple-50">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Final Decision</h3>
            <p className="text-gray-600">
              Nothing goes to students without your approval. You make the final call 
              on every aspect of the grading and feedback process.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotAnAutoGrader;
