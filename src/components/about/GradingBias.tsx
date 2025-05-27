
import React from 'react';
import { Scale, Eye, TrendingUp } from 'lucide-react';

const GradingBias = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Reducing Grading Bias Through AI Assistance
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Even the most dedicated teachers unconsciously compare submissions to each other. 
            A.L.L.E.N. helps provide more consistent, objective starting points for evaluation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">The Problem</h3>
            <p className="text-gray-600">
              Traditional grading often involves unconscious comparisons between student work, 
              leading to inconsistent standards and potential bias.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Consistency</h3>
            <p className="text-gray-600">
              A.L.L.E.N. evaluates each submission against the same criteria every time, 
              providing consistent starting points for your review.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Outcomes</h3>
            <p className="text-gray-600">
              More consistent grading leads to fairer outcomes while still preserving 
              your professional judgment and contextual understanding.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
            You Still Bring What AI Cannot
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Your Expertise Includes:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Understanding student growth and progress</li>
                <li>• Contextual knowledge of individual learners</li>
                <li>• Classroom dynamics and participation</li>
                <li>• Pedagogical insights and teaching experience</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">AI Provides:</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Consistent evaluation criteria application</li>
                <li>• Objective content analysis</li>
                <li>• Time-saving initial assessments</li>
                <li>• Reduced fatigue-related inconsistencies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GradingBias;
