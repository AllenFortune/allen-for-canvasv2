
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCachedSession, withRetry } from '@/utils/courseUtils';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  needs_grading_count: number;
  submission_types: string[];
}

interface Discussion {
  id: number;
  title: string;
  posted_at: string | null;
  discussion_type: string;
  unread_count: number;
  todo_date: string | null;
  needs_grading_count?: number;
  graded_count?: number;
  total_submissions?: number;
  assignment_id?: number;
  is_assignment?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  due_at: string | null;
  points_possible: number | null;
  quiz_type: string;
  time_limit: number | null;
  allowed_attempts: number | null;
  published: boolean;
}

export const useCourseContent = (courseId: string | undefined) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchAssignments();
      fetchDiscussions();
      fetchQuizzes();
    }
  }, [courseId, user]);

  const fetchAssignments = async () => {
    if (!user || !courseId) return;

    setAssignmentsLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for assignments');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-assignments', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.assignments) {
        setAssignments(data.assignments);
        console.log(`Loaded ${data.assignments.length} assignments`);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    if (!user || !courseId) return;

    setDiscussionsLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for discussions');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-discussions', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.discussions) {
        setDiscussions(data.discussions);
        console.log(`Loaded ${data.discussions.length} discussions`);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    if (!user || !courseId) return;

    setQuizzesLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for quizzes');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-quizzes', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.quizzes) {
        setQuizzes(data.quizzes);
        console.log(`Loaded ${data.quizzes.length} quizzes`);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setQuizzesLoading(false);
    }
  };

  return {
    assignments,
    discussions,
    quizzes,
    assignmentsLoading,
    discussionsLoading,
    quizzesLoading
  };
};
