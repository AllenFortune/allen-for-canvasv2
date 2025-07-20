
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnhancedAssignmentHeader from '@/components/grading/EnhancedAssignmentHeader';
import GradeAssignmentContent from '@/components/grading/GradeAssignmentContent';
import ErrorDisplay from '@/components/grading/ErrorDisplay';
import LoadingDisplay from '@/components/grading/LoadingDisplay';
import FloatingVoiceControls from '@/components/FloatingVoiceControls';
import { useGradeAssignment } from '@/hooks/useGradeAssignment';
import { useAuth } from '@/contexts/AuthContext';

const GradeAssignment = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const { session } = useAuth();
  const {
    assignment,
    submissions,
    loading,
    error,
    saveGrade,
    retryFetch,
    setSubmissions
  } = useGradeAssignment(courseId, assignmentId);

  // Show loading if still authenticating
  if (!session) {
    return <LoadingDisplay />;
  }

  if (loading) {
    return <LoadingDisplay />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16"> {/* Account for fixed header */}
          <EnhancedAssignmentHeader 
            courseId={courseId!} 
            assignment={assignment}
            submissions={submissions}
          />

          {error && (
            <div className="max-w-7xl mx-auto px-6 py-6">
              <ErrorDisplay error={error} onRetry={retryFetch} />
            </div>
          )}

          <GradeAssignmentContent
            assignment={assignment}
            submissions={submissions}
            saveGrade={saveGrade}
            setSubmissions={setSubmissions}
          />
        </div>
        
        {/* Floating voice controls for mobile */}
        <FloatingVoiceControls />
      </div>
    </ProtectedRoute>
  );
};

export default GradeAssignment;
