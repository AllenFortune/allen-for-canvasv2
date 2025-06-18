
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Submission } from '@/types/grading';

export const useSubmissionsData = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const fetchSubmissions = async (courseId: string, assignmentId: string) => {
    try {
      console.log(`Fetching submissions for assignment ${assignmentId} in course ${courseId}`);
      
      const { data, error } = await supabase.functions.invoke('get-canvas-assignment-submissions', {
        body: {
          courseId,
          assignmentId
        }
      });
      
      if (error) {
        console.error('Error fetching submissions:', error);
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }
      
      if (data && data.submissions && Array.isArray(data.submissions)) {
        console.log(`Received ${data.submissions.length} submissions (including all enrolled students)`);
        
        // Sort submissions by student's sortable name
        const sortedSubmissions = data.submissions.sort((a: Submission, b: Submission) => {
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
