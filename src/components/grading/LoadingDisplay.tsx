
import React from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

const LoadingDisplay: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading assignment details...</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LoadingDisplay;
