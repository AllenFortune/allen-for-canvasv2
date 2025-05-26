
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Submission } from '@/types/grading';
import { useCanvasCredentials } from './useCanvasCredentials';

export const useSubmissionsData = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const { getCanvasCredentials } = useCanvasCredentials();

  const fetchSubmissions = async (courseId: string, assignmentId: string) => {
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
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }
      
      if (data && Array.isArray(data)) {
        console.log(`Received ${data.length} submissions from Canvas`);
        
        // Sort submissions by student's sortable name
        const sortedSubmissions = data.sort((a: Submission, b: Submission) => {
          return (a.user.sortable_name || a.user.name).localeCompare(b.user.sortable_name || b.user.name);
        });
        
        setSubmissions(sortedSubmissions);
      } else {
        console.log('No submissions found in response');
        setSubmissions([]);
        throw new Error('No submissions found for this assignment');
      }
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
