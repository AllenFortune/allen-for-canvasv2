
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import GradeAssignmentHeader from '@/components/grading/GradeAssignmentHeader';
import GradeAssignmentContent from '@/components/grading/GradeAssignmentContent';
import ErrorDisplay from '@/components/grading/ErrorDisplay';
import LoadingDisplay from '@/components/grading/LoadingDisplay';
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
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <GradeAssignmentHeader 
              courseId={courseId!} 
              assignment={assignment} 
            />

            {error && (
              <ErrorDisplay error={error} onRetry={retryFetch} />
            )}

            <GradeAssignmentContent
              assignment={assignment}
              submissions={submissions}
              saveGrade={saveGrade}
              setSubmissions={setSubmissions}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeAssignment;
