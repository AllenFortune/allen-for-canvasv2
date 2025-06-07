
import { supabase } from '@/integrations/supabase/client';
import { Submission } from '@/types/grading';
import { toast } from '@/hooks/use-toast';
import { useCanvasCredentials } from './useCanvasCredentials';
import { useSubscription } from './useSubscription';
import { useAuditLog } from './useAuditLog';

export const useGradeSaving = () => {
  const { getCanvasCredentials } = useCanvasCredentials();
  const { incrementUsage } = useSubscription();
  const { logAction } = useAuditLog();

  const saveGrade = async (
    submissionId: number | string,
    grade: string,
    comment: string,
    courseId: string,
    assignmentId: string,
    submissions: Submission[],
    setSubmissions: (submissions: Submission[]) => void
  ) => {
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

    // Check usage limits before proceeding (now uses billing period logic)
    const canProceed = await incrementUsage();
    if (!canProceed) {
      return false; // Toast message already shown in incrementUsage
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
      
      // Log the grading action for audit trail
      await logAction({
        action: 'GRADE_SUBMISSION',
        table_name: 'canvas_submissions',
        record_id: submissionId.toString(),
        new_values: {
          grade,
          comment: comment || null,
          course_id: courseId,
          assignment_id: assignmentId,
          student_id: userId
        }
      });
      
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
        
        // Log the failed attempt
        await logAction({
          action: 'GRADE_SUBMISSION_FAILED',
          table_name: 'canvas_submissions',
          record_id: submissionId.toString(),
          new_values: {
            error: errorMessage,
            attempted_grade: grade,
            course_id: courseId,
            assignment_id: assignmentId
          }
        });
        
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
      const updatedSubmissions = submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, score: parseFloat(grade) || null, workflow_state: 'graded' }
          : sub
      );
      setSubmissions(updatedSubmissions);
      
      return true;
    } catch (error) {
      console.error('Unexpected error saving grade:', error);
      
      // Log the unexpected error
      await logAction({
        action: 'GRADE_SUBMISSION_ERROR',
        table_name: 'canvas_submissions',
        record_id: submissionId.toString(),
        new_values: {
          error: error instanceof Error ? error.message : 'Unknown error',
          attempted_grade: grade,
          course_id: courseId,
          assignment_id: assignmentId
        }
      });
      
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the grade",
        variant: "destructive",
      });
      return false;
    }
  };

  return { saveGrade };
};
