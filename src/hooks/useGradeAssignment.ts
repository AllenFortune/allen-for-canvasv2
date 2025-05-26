
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission } from '@/types/grading';

export const useGradeAssignment = (courseId: string | undefined, assignmentId: string | undefined) => {
  const { session } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignmentDetails = async () => {
    if (!session || !courseId || !assignmentId) return;

    try {
      console.log(`Fetching assignment details for assignment ${assignmentId} in course ${courseId}`);
      console.log('Session exists:', !!session);
      
      const { data, error } = await supabase.functions.invoke('get-canvas-assignment-details', {
        body: { 
          courseId: parseInt(courseId), 
          assignmentId: parseInt(assignmentId) 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      if (error) {
        console.error('Error fetching assignment details:', error);
        setError(`Failed to fetch assignment details: ${error.message}`);
        return;
      }
      
      if (data && data.assignment) {
        setAssignment(data.assignment);
        console.log('Assignment details loaded:', data.assignment.name);
        console.log('Assignment description received:', data.assignment.description?.length > 0 ? 'Yes' : 'No');
      } else {
        console.error('No assignment data received');
        setError('No assignment data received from server');
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setError('Failed to fetch assignment details');
    }
  };

  const fetchSubmissions = async () => {
    if (!session || !courseId || !assignmentId) return;

    try {
      console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId}`);
      console.log('Session exists:', !!session);
      
      const { data, error } = await supabase.functions.invoke('get-canvas-assignment-submissions', {
        body: { 
          courseId: parseInt(courseId), 
          assignmentId: parseInt(assignmentId) 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        setError(`Failed to fetch submissions: ${error.message}`);
        return;
      }
      
      if (data && data.submissions) {
        console.log(`Received ${data.submissions.length} submissions from Canvas`);
        console.log('First submission sample:', data.submissions[0]);
        
        // Sort submissions by student's sortable name
        const sortedSubmissions = data.submissions.sort((a: Submission, b: Submission) => {
          return (a.user.sortable_name || a.user.name).localeCompare(b.user.sortable_name || b.user.name);
        });
        
        setSubmissions(sortedSubmissions);
        setError(null);
      } else {
        console.log('No submissions found in response');
        setSubmissions([]);
        setError('No submissions found for this assignment');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (submissionId: number, grade: string, comment: string) => {
    if (!session || !courseId || !assignmentId) return false;

    try {
      console.log(`Saving grade for submission ${submissionId}: ${grade}`);
      
      const { data, error } = await supabase.functions.invoke('grade-canvas-submission', {
        body: { 
          courseId: parseInt(courseId), 
          assignmentId: parseInt(assignmentId),
          submissionId,
          grade,
          comment
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      if (error) {
        console.error('Error saving grade:', error);
        throw error;
      }
      
      console.log('Grade saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving grade:', error);
      return false;
    }
  };

  const retryFetch = () => {
    console.log('Retrying fetch operations...');
    setError(null);
    setLoading(true);
    fetchAssignmentDetails();
    fetchSubmissions();
  };

  useEffect(() => {
    if (courseId && assignmentId && session) {
      console.log('Initializing grade assignment with:', { courseId, assignmentId, sessionExists: !!session });
      fetchAssignmentDetails();
      fetchSubmissions();
    }
  }, [courseId, assignmentId, session]);

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
