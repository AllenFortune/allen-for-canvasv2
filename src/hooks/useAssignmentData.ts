
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assignment } from '@/types/grading';
import { useCanvasCredentials } from './useCanvasCredentials';

export const useAssignmentData = () => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const { getCanvasCredentials } = useCanvasCredentials();

  const fetchAssignmentDetails = async (courseId: string, assignmentId: string) => {
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
        throw new Error(`Failed to fetch assignment details: ${error.message}`);
      }
      
      if (data) {
        setAssignment(data);
        console.log('Assignment details loaded:', data.name);
        console.log('Assignment description received:', data.description?.length > 0 ? 'Yes' : 'No');
      } else {
        console.error('No assignment data received');
        throw new Error('No assignment data received from server');
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      throw error;
    }
  };

  return {
    assignment,
    setAssignment,
    fetchAssignmentDetails
  };
};
