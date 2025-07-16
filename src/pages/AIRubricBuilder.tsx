
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import RubricBuilderWizard from '@/components/rubric-builder/RubricBuilderWizard';

const AIRubricBuilder = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Rubric Builder
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Automatically generate comprehensive assessment rubrics from your Canvas assignments or pasted content. 
                Seamlessly integrates with the DIVER Framework to create aligned assessment criteria.
              </p>
            </div>
            
            <RubricBuilderWizard />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIRubricBuilder;
