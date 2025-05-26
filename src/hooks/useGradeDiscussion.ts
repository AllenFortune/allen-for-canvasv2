
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

  const fetchDiscussionDetails = async () => {
    if (!courseId || !discussionId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('get-canvas-discussion-details', {
        body: { courseId, discussionId }
      });

      if (error) throw error;

      setDiscussion(data.discussion);
    } catch (err) {
      console.error('Error fetching discussion details:', err);
      setError(err.message || 'Failed to fetch discussion details');
    }
  };

  const fetchDiscussionEntries = async () => {
    if (!courseId || !discussionId) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-discussion-entries', {
        body: { courseId, discussionId }
      });

      if (error) throw error;

      setEntries(data.entries);
    } catch (err) {
      console.error('Error fetching discussion entries:', err);
      setError(err.message || 'Failed to fetch discussion entries');
    } finally {
      setLoading(false);
    }
  };

  const saveGrade = async (userId: number, grade: string, feedback: string) => {
    if (!courseId || !discussionId) {
      toast({
        title: "Error",
        description: "Missing course or discussion information",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('grade-canvas-discussion-entry', {
        body: {
          courseId,
          discussionId,
          userId,
          grade,
          feedback
        }
      });

      if (error) throw error;

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
    await Promise.all([fetchDiscussionDetails(), fetchDiscussionEntries()]);
  };

  useEffect(() => {
    if (courseId && discussionId) {
      Promise.all([fetchDiscussionDetails(), fetchDiscussionEntries()]);
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
