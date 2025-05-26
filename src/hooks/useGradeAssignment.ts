
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssignmentData } from './useAssignmentData';
import { useSubmissionsData } from './useSubmissionsData';
import { useGradeSaving } from './useGradeSaving';

export const useGradeAssignment = (courseId: string | undefined, assignmentId: string | undefined) => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { assignment, fetchAssignmentDetails } = useAssignmentData();
  const { submissions, setSubmissions, fetchSubmissions } = useSubmissionsData();
  const { saveGrade: saveGradeInternal } = useGradeSaving();

  const saveGrade = async (submissionId: number | string, grade: string, comment: string) => {
    if (!courseId || !assignmentId) return false;
    return saveGradeInternal(submissionId, grade, comment, courseId, assignmentId, submissions, setSubmissions);
  };

  const retryFetch = () => {
    console.log('Retrying fetch operations...');
    setError(null);
    setLoading(true);
    
    if (!courseId || !assignmentId) {
      setLoading(false);
      setError('Missing course or assignment information');
      return;
    }

    Promise.all([
      fetchAssignmentDetails(courseId, assignmentId),
      fetchSubmissions(courseId, assignmentId)
    ])
    .then(() => {
      setError(null);
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    });
  };

  useEffect(() => {
    if (courseId && assignmentId && session?.user?.id) {
      console.log('Initializing grade assignment with:', { 
        courseId, 
        assignmentId, 
        hasUser: !!session.user.id 
      });
      
      Promise.all([
        fetchAssignmentDetails(courseId, assignmentId),
        fetchSubmissions(courseId, assignmentId)
      ])
      .then(() => {
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch data');
        setLoading(false);
      });
    } else {
      setLoading(false);
      setError('Missing authentication or course/assignment information');
    }
  }, [courseId, assignmentId, session?.user?.id]);

  return {
    assignment,
    submissions,
    loading,
    error,
    saveGrade,
    retryFetch,
    setSubmissions
  };
};
