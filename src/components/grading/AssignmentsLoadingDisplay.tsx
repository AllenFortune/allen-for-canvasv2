
import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

const loadingMessages = [
  "🤖 ALLEN is scanning your courses for assignments...",
  "🔍 Analyzing Canvas data with AI precision...",
  "📚 Gathering assignments from all your courses...",
  "⚡ Processing assignments at the speed of light...",
  "📝 Collecting submissions that need your attention...",
  "🧠 AI brain cells are working overtime...",
  "🎯 Hunting down those ungraded assignments...",
  "📊 Organizing your grading queue...",
  "☕ Perfect time for a coffee break while ALLEN works...",
  "🚀 Almost ready to make your grading easier...",
  "✨ Preparing your personalized grading dashboard...",
  "🎉 Getting everything ready for efficient grading..."
];

const AssignmentsLoadingDisplay: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setIsVisible(true);
      }, 300); // Half of the transition duration
      
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p 
                className={`mt-4 text-gray-600 text-lg font-medium transition-opacity duration-600 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ minHeight: '1.5rem' }}
              >
                {loadingMessages[currentMessageIndex]}
              </p>
              <p className="mt-2 text-gray-500 text-sm">
                This may take a moment for courses with many assignments
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AssignmentsLoadingDisplay;
