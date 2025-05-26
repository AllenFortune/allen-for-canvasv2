
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Discussion } from '@/types/grading';
import { UseDiscussionDetailsReturn } from '@/types/discussionGrading';

export const useDiscussionDetails = (courseId?: string, discussionId?: string): UseDiscussionDetailsReturn => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscussionDetails = async () => {
    if (!courseId || !discussionId) {
      console.log('Missing courseId or discussionId for fetchDiscussionDetails');
      return;
    }

    try {
      console.log('Fetching discussion details...');
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('get-canvas-discussion-details', {
        body: { courseId, discussionId }
      });

      if (error) {
        console.error('Error from get-canvas-discussion-details:', error);
        throw error;
      }

      console.log('Discussion details received:', data);
      console.log('Discussion points_possible:', data.discussion?.points_possible);
      console.log('Assignment data:', data.discussion?.assignment);
      console.log('Assignment points_possible:', data.discussion?.assignment?.points_possible);
      
      setDiscussion(data.discussion);
    } catch (err) {
      console.error('Error fetching discussion details:', err);
      setError(err.message || 'Failed to fetch discussion details');
    } finally {
      setLoading(false);
    }
  };

  return {
    discussion,
    loading,
    error,
    fetchDiscussionDetails
  };
};
