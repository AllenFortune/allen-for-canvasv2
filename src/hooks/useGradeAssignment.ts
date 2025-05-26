
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

  const getCanvasCredentials = async () => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('canvas_instance_url, canvas_access_token')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch Canvas credentials: ${profileError.message}`);
    }

    if (!profile?.canvas_instance_url || !profile?.canvas_access_token) {
      throw new Error('Canvas credentials not configured');
    }

    return {
      canvasUrl: profile.canvas_instance_url,
      canvasToken: profile.canvas_access_token
    };
  };

  const fetchAssignmentDetails = async () => {
    if (!courseId || !assignmentId) {
      console.log('Missing courseId or assignmentId');
      return;
    }

    try {
      console.log(`Fetching assignment details for assignment ${assignmentId} in course ${courseId}`);
      
      const credentials = await getCanvasCredentials();
      
      const { data, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          canvasUrl: credentials.canvasUrl,
          canvasToken: credentials.canvasToken,
          endpoint: `courses/${courseId}/assignments/${assignmentId}`,
          queryParams: {
            'include[]': ['description', 'rubric_criteria']
          }
        }
      });
      
      if (error) {
        console.error('Error fetching assignment details:', error);
        setError(`Failed to fetch assignment details: ${error.message}`);
        return;
      }
      
      if (data) {
        setAssignment(data);
        console.log('Assignment details loaded:', data.name);
        console.log('Assignment description received:', data.description?.length > 0 ? 'Yes' : 'No');
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
    if (!courseId || !assignmentId) {
      console.log('Missing courseId or assignmentId for submissions');
      return;
    }

    try {
      console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId}`);
      
      const credentials = await getCanvasCredentials();
      
      const { data, error } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          canvasUrl: credentials.canvasUrl,
          canvasToken: credentials.canvasToken,
          endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions`,
          queryParams: {
            'include[]': ['user', 'submission_comments', 'attachments']
          }
        }
      });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        setError(`Failed to fetch submissions: ${error.message}`);
        return;
      }
      
      if (data && Array.isArray(data)) {
        console.log(`Received ${data.length} submissions from Canvas`);
        
        // Sort submissions by student's sortable name
        const sortedSubmissions = data.sort((a: Submission, b: Submission) => {
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
    if (!courseId || !assignmentId) return false;

    try {
      console.log(`Saving grade for submission ${submissionId}: ${grade}`);
      
      const credentials = await getCanvasCredentials();
      
      // First, save the grade
      const { data: gradeData, error: gradeError } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          canvasUrl: credentials.canvasUrl,
          canvasToken: credentials.canvasToken,
          endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}`,
          method: 'PUT',
          requestBody: {
            submission: {
              posted_grade: grade
            }
          }
        }
      });
      
      if (gradeError) {
        console.error('Error saving grade:', gradeError);
        throw gradeError;
      }

      // If there's a comment, add it separately
      if (comment) {
        const { error: commentError } = await supabase.functions.invoke('canvas-proxy', {
          body: {
            canvasUrl: credentials.canvasUrl,
            canvasToken: credentials.canvasToken,
            endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/comments`,
            method: 'PUT',
            requestBody: {
              comment: {
                text_comment: comment
              }
            }
          }
        });

        if (commentError) {
          console.warn('Could not add comment:', commentError);
        }
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
    if (courseId && assignmentId && session?.user?.id) {
      console.log('Initializing grade assignment with:', { 
        courseId, 
        assignmentId, 
        hasUser: !!session.user.id 
      });
      fetchAssignmentDetails();
      fetchSubmissions();
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
