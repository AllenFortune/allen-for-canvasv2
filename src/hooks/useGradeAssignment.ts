
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  html_url: string;
  submission_types: string[];
}

interface Submission {
  id: number | string;
  user_id: number;
  assignment_id: number;
  submitted_at: string | null;
  graded_at: string | null;
  grade: string | null;
  score: number | null;
  submission_comments: any[] | null;
  body: string | null;
  url: string | null;
  attachments: any[];
  workflow_state: string;
  late: boolean;
  missing: boolean;
  submission_type: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    sortable_name: string;
  };
}

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
      
      if (data.assignment) {
        setAssignment(data.assignment);
        console.log('Assignment details loaded:', data.assignment.name);
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
