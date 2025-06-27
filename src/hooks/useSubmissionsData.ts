
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Submission } from '@/types/grading';
import { useCanvasCredentials } from './useCanvasCredentials';
import { getCachedSession, withRetry } from '@/utils/courseUtils';

export const useSubmissionsData = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { getCanvasCredentials } = useCanvasCredentials();

  const fetchSubmissions = async (courseId: string, assignmentId: string) => {
    try {
      console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId}`);
      
      const credentials = await getCanvasCredentials();
      
      // First, fetch all enrolled students in the course
      console.log('Fetching enrolled students...');
      const { data: enrollmentsData, error: enrollmentsError } = await withRetry(() =>
        supabase.functions.invoke('canvas-proxy', {
          body: {
            canvasUrl: credentials.canvasUrl,
            canvasToken: credentials.canvasToken,
            endpoint: `courses/${courseId}/enrollments`,
            queryParams: {
              'type[]': 'StudentEnrollment',
              'state[]': 'active',
              per_page: 100
            }
          }
        })
      );

      if (enrollmentsError) {
        console.warn('Failed to fetch enrollments:', enrollmentsError);
      }

      const enrolledStudents = enrollmentsData || [];
      console.log(`Found ${enrolledStudents.length} enrolled students`);
      
      // Then fetch submissions with student information
      console.log('Fetching submissions...');
      const { data: submissionsData, error: submissionsError } = await withRetry(() =>
        supabase.functions.invoke('canvas-proxy', {
          body: {
            canvasUrl: credentials.canvasUrl,
            canvasToken: credentials.canvasToken,
            endpoint: `courses/${courseId}/assignments/${assignmentId}/submissions`,
            queryParams: {
              'include[]': ['user', 'submission_comments', 'submission_history', 'attachments'],
              per_page: 100
            }
          }
        })
      );
      
      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
        throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
      }
      
      const submissions = submissionsData || [];
      console.log(`Canvas returned ${submissions.length} submission records`);

      // Create a map of submissions by user ID for easy lookup
      const submissionsByUserId = new Map();
      submissions.forEach((sub: any) => {
        submissionsByUserId.set(sub.user_id, sub);
      });

      // Create a complete list that includes all enrolled students
      const allSubmissions = [];

      // Add existing submissions
      submissions.forEach((submission: any) => {
        allSubmissions.push({
          id: submission.id,
          user_id: submission.user_id,
          assignment_id: submission.assignment_id,
          submitted_at: submission.submitted_at,
          graded_at: submission.graded_at,
          grade: submission.grade,
          score: submission.score,
          submission_comments: submission.submission_comments || [],
          body: submission.body,
          url: submission.url,
          attachments: submission.attachments || [],
          workflow_state: submission.workflow_state,
          late: submission.late || false,
          missing: submission.missing || false,
          submission_type: submission.submission_type,
          user: {
            id: submission.user?.id,
            name: submission.user?.name || 'Unknown User',
            email: submission.user?.email || '',
            avatar_url: submission.user?.avatar_url,
            sortable_name: submission.user?.sortable_name || submission.user?.name || 'Unknown User'
          }
        });
      });

      // Add enrolled students who don't have submission records
      enrolledStudents.forEach((enrollment: any) => {
        if (!submissionsByUserId.has(enrollment.user_id)) {
          console.log(`Creating placeholder submission for student: ${enrollment.user?.name || 'Unknown'}`);
          allSubmissions.push({
            id: `placeholder_${enrollment.user_id}`,
            user_id: enrollment.user_id,
            assignment_id: parseInt(assignmentId),
            submitted_at: null,
            graded_at: null,
            grade: null,
            score: null,
            submission_comments: [],
            body: null,
            url: null,
            attachments: [],
            workflow_state: 'unsubmitted',
            late: false,
            missing: true,
            submission_type: null,
            user: {
              id: enrollment.user?.id,
              name: enrollment.user?.name || 'Unknown User',
              email: enrollment.user?.email || '',
              avatar_url: enrollment.user?.avatar_url,
              sortable_name: enrollment.user?.sortable_name || enrollment.user?.name || 'Unknown User'
            }
          });
        }
      });

      console.log(`Successfully processed ${allSubmissions.length} total submission records (including enrolled students)`);
      
      // Sort submissions by student's sortable name
      const sortedSubmissions = allSubmissions.sort((a: Submission, b: Submission) => {
        return (a.user.sortable_name || a.user.name).localeCompare(b.user.sortable_name || b.user.name);
      });
      
      setSubmissions(sortedSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  };

  return {
    submissions,
    setSubmissions,
    fetchSubmissions
  };
};
