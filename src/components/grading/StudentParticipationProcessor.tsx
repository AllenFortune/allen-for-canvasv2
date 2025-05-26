
import { useMemo } from 'react';
import { DiscussionEntry } from '@/types/grading';

export interface StudentParticipation {
  studentEntries: DiscussionEntry[];
  initialPosts: DiscussionEntry[];
  replies: DiscussionEntry[];
  repliedToPosts: DiscussionEntry[];
  allRelevantEntries: DiscussionEntry[];
  totalParticipation: number;
}

interface UseStudentParticipationProps {
  entries: DiscussionEntry[];
  userId: number;
}

export const useStudentParticipation = ({ entries, userId }: UseStudentParticipationProps): StudentParticipation => {
  return useMemo(() => {
    console.log('Processing participation for user ID:', userId);
    
    const studentEntries = entries.filter(entry => entry.user_id === userId);
    console.log('Student entries found:', studentEntries.length, studentEntries);
    
    const initialPosts = studentEntries.filter(entry => !entry.parent_id);
    console.log('Initial posts:', initialPosts.length, initialPosts);
    
    const replies = studentEntries.filter(entry => entry.parent_id);
    console.log('Replies:', replies.length, replies);
    
    // Get original posts that this student replied to for context
    const repliedToPosts = replies.map(reply => {
      const originalPost = entries.find(entry => entry.id === reply.parent_id);
      console.log(`Looking for parent ${reply.parent_id} for reply ${reply.id}:`, originalPost ? 'FOUND' : 'NOT FOUND');
      return originalPost;
    }).filter(Boolean) as DiscussionEntry[];

    console.log('Replied to posts found:', repliedToPosts.length);

    // Combine all relevant entries in chronological order
    const allRelevantEntries = [...initialPosts, ...replies, ...repliedToPosts]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    console.log('All relevant entries:', allRelevantEntries.length);

    const participation = {
      studentEntries,
      initialPosts,
      replies,
      repliedToPosts,
      allRelevantEntries,
      totalParticipation: studentEntries.length
    };

    console.log('Final participation object:', participation);
    return participation;
  }, [entries, userId]);
};
