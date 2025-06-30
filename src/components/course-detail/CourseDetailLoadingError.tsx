
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

interface LoadingStateProps {
  type: 'loading';
}

interface ErrorStateProps {
  type: 'error';
  error: string;
}

type CourseDetailStateProps = LoadingStateProps | ErrorStateProps;

const CourseDetailLoadingError: React.FC<CourseDetailStateProps> = (props) => {
  if (props.type === 'loading') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading course details...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Course Not Found</h3>
                <div className="text-red-600 mb-6 text-left whitespace-pre-line">
                  {props.error}
                </div>
                <div className="space-y-3">
                  <Link to="/courses">
                    <Button className="w-full">Back to Courses</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  {props.error?.includes('Canvas credentials') && (
                    <Link to="/settings">
                      <Button variant="outline" className="w-full">
                        Configure Canvas Settings
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  );
};

export default CourseDetailLoadingError;
