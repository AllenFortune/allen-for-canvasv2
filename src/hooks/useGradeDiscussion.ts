
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';

export const useGradeDiscussion = (courseId?: string, discussionId?: string) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [entries, setEntries] = useState<DiscussionEntry[]>([]);
  const [grades, setGrades] = useState<DiscussionGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  console.log('useGradeDiscussion hook initialized with:', { courseId, discussionId });

  const fetchDiscussionDetails = async () => {
    if (!courseId || !discussionId) {
      console.log('Missing courseId or discussionId for fetchDiscussionDetails');
      return;
    }

    try {
      console.log('Fetching discussion details...');
      setError(null);

      const { data, error } = await supabase.functions.invoke('get-canvas-discussion-details', {
        body: { courseId, discussionId }
      });

      if (error) {
        console.error('Error from get-canvas-discussion-details:', error);
        throw error;
      }

      console.log('Discussion details received:', data);
      setDiscussion(data.discussion);
    } catch (err) {
      console.error('Error fetching discussion details:', err);
      setError(err.message || 'Failed to fetch discussion details');
    }
  };

  const fetchDiscussionEntries = async () => {
    if (!courseId || !discussionId) {
      console.log('Missing courseId or discussionId for fetchDiscussionEntries');
      return;
    }

    try {
      console.log('Fetching ALL discussion entries...');
      
      const { data, error } = await supabase.functions.invoke('get-canvas-discussion-entries', {
        body: { courseId, discussionId }
      });

      if (error) {
        console.error('Error from get-canvas-discussion-entries:', error);
        throw error;
      }

      console.log('Discussion entries received:', data);
      console.log('Number of entries:', data.entries?.length || 0);
      
      // Process ALL entries to normalize user data from Canvas API
      const processedEntries = data.entries?.map((entry: any) => ({
        ...entry,
        user: {
          id: entry.user_id,
          name: entry.user?.display_name || entry.user_name || `User ${entry.user_id}`,
          display_name: entry.user?.display_name || entry.user_name,
          email: entry.user?.email,
          avatar_url: entry.user?.avatar_image_url || entry.user?.avatar_url,
          avatar_image_url: entry.user?.avatar_image_url,
          sortable_name: entry.user?.sortable_name,
          html_url: entry.user?.html_url,
          pronouns: entry.user?.pronouns
        }
      })) || [];
      
      console.log('Processed ALL entries:', processedEntries.length);
      if (processedEntries.length > 0) {
        console.log('Sample processed entry:', processedEntries[0]);
        
        // Log unique users for debugging
        const uniqueUsers = Array.from(
          new Set(processedEntries.map(entry => entry.user_id))
        ).map(userId => {
          const entry = processedEntries.find(e => e.user_id === userId);
          return {
            id: userId,
            name: entry?.user?.name,
            entriesCount: processedEntries.filter(e => e.user_id === userId).length
          };
        });
        
        console.log('Unique participating users:', uniqueUsers);
      }
      
      // Store ALL entries (not filtered by user)
      setEntries(processedEntries);
    } catch (err) {
      console.error('Error fetching discussion entries:', err);
      setError(err.message || 'Failed to fetch discussion entries');
      
      toast({
        title: "Error loading discussion entries",
        description: "Could not load discussion posts. Please check your Canvas connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (userId: number, grade: string, feedback: string) => {
    if (!courseId || !discussionId) {
      console.error('Missing courseId or discussionId for saveGrade');
      toast({
        title: "Error",
        description: "Missing course or discussion information",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Saving grade for user:', { userId, grade, feedback });
      
      const { data, error } = await supabase.functions.invoke('grade-canvas-discussion-entry', {
        body: {
          courseId,
          discussionId,
          userId,
          grade,
          feedback
        }
      });

      if (error) {
        console.error('Error from grade-canvas-discussion-entry:', error);
        throw error;
      }

      console.log('Grade saved successfully:', data);

      // Update local grades state
      setGrades(prev => {
        const existing = prev.find(g => g.user_id === userId);
        if (existing) {
          return prev.map(g => 
            g.user_id === userId 
              ? { ...g, grade, score: parseFloat(grade), feedback }
              : g
          );
        } else {
          return [...prev, { user_id: userId, grade, score: parseFloat(grade), feedback }];
        }
      });

      toast({
        title: "Success",
        description: "Grade saved successfully!",
      });

      return true;
    } catch (err) {
      console.error('Error saving grade:', err);
      toast({
        title: "Error",
        description: "Failed to save grade. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const retryFetch = async () => {
    console.log('Retrying fetch operations...');
    setLoading(true);
    setError(null);
    await Promise.all([fetchDiscussionDetails(), fetchDiscussionEntries()]);
  };

  useEffect(() => {
    if (courseId && discussionId) {
      console.log('Starting fetch operations...');
      Promise.all([fetchDiscussionDetails(), fetchDiscussionEntries()]);
    } else {
      console.log('Missing courseId or discussionId in useEffect');
      setLoading(false);
    }
  }, [courseId, discussionId]);

  return {
    discussion,
    entries,
    grades,
    loading,
    error,
    saveGrade,
    retryFetch,
    setEntries,
    setGrades
  };
};
