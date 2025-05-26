import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Assignment, Submission } from '@/types/grading';
import { toast } from '@/hooks/use-toast';

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

  const saveGrade = async (submissionId: number | string, grade: string, comment: string) => {
    if (!courseId || !assignmentId) {
      toast({
        title: "Error",
        description: "Missing course or assignment information",
        variant: "destructive",
      });
      return false;
    }

    // Handle placeholder submissions - check if it's a string that starts with 'placeholder_'
    if (typeof submissionId === 'string' && submissionId.startsWith('placeholder_')) {
      toast({
        title: "Cannot Grade",
        description: "Cannot grade students who haven't submitted anything yet",
        variant: "destructive",
      });
      return false;
    }

    // Find the submission to get the user_id
    const submission = submissions.find(sub => sub.id === submissionId);
    if (!submission) {
      toast({
        title: "Error",
        description: "Submission not found",
        variant: "destructive",
      });
      return false;
    }

    const userId = submission.user_id;
    console.log(`Saving grade for user ${userId} (submission ${submissionId}): ${grade}`);

    try {
      const credentials = await getCanvasCredentials();
      
      // Use the correct Canvas API endpoint with user_id and combine grade + comment
      const requestBody: any = {
        submission: {
          posted_grade: grade
        }
      };

      // Add comment to the submission if provided
      if (comment && comment.trim()) {
        requestBody.comment = {
          text_comment: comment
        };
      }

      console.log('Sending request to Canvas API:', {
        endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
        body: requestBody
      });

      const { data: response, error: gradeError } = await supabase.functions.invoke('canvas-proxy', {
        body: {
          canvasUrl: credentials.canvasUrl,
          canvasToken: credentials.canvasToken,
          endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`,
          method: 'PUT',
          requestBody: requestBody
        }
      });
      
      if (gradeError) {
        console.error('Canvas API error details:', gradeError);
        let errorMessage = `Failed to save grade: ${gradeError.message}`;
        
        // Provide more specific error messages based on common Canvas API errors
        if (gradeError.message.includes('404')) {
          errorMessage = 'Assignment or student not found. Please check if the assignment accepts submissions.';
        } else if (gradeError.message.includes('403')) {
          errorMessage = 'Permission denied. Please check your Canvas permissions for grading.';
        } else if (gradeError.message.includes('422')) {
          errorMessage = 'Invalid grade format. Please check the grade value and try again.';
        }
        
        toast({
          title: "Grade Save Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      console.log('Grade and feedback saved successfully to Canvas:', response);
      toast({
        title: "Success",
        description: "Grade and feedback saved to Canvas",
        variant: "default",
      });
      
      // Update the local submission status
      setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => 
          sub.id === submissionId 
            ? { ...sub, score: parseFloat(grade) || null, workflow_state: 'graded' }
            : sub
        )
      );
      
      return true;
    } catch (error) {
      console.error('Unexpected error saving grade:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the grade",
        variant: "destructive",
      });
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
