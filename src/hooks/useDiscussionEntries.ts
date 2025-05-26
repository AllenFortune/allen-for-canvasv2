
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DiscussionEntry } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';
import { UseDiscussionEntriesReturn } from '@/types/discussionGrading';

export const useDiscussionEntries = (courseId?: string, discussionId?: string): UseDiscussionEntriesReturn => {
  const [entries, setEntries] = useState<DiscussionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDiscussionEntries = async () => {
    if (!courseId || !discussionId) {
      console.log('Missing courseId or discussionId for fetchDiscussionEntries');
      return;
    }

    try {
      console.log('Fetching ALL discussion entries...');
      setLoading(true);
      setError(null);
      
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

  return {
    entries,
    loading,
    error,
    fetchDiscussionEntries,
    setEntries
  };
};
