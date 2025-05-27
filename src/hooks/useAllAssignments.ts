
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface Assignment {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  course_code: string;
  due_at: string | null;
  points_possible: number;
  needs_grading_count: number;
  html_url: string;
}

type SortOrder = 'oldest-first' | 'newest-first';

export const useAllAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-all-assignments-needing-grading', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.assignments) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sortAssignments = (assignments: Assignment[], order: SortOrder) => {
    const assignmentsWithDueDate = assignments.filter(a => a.due_at);
    const assignmentsWithoutDueDate = assignments.filter(a => !a.due_at);

    // Sort assignments with due dates
    assignmentsWithDueDate.sort((a, b) => {
      const dateA = new Date(a.due_at!).getTime();
      const dateB = new Date(b.due_at!).getTime();
      
      return order === 'oldest-first' ? dateA - dateB : dateB - dateA;
    });

    // For oldest-first, put assignments without due dates at the end
    // For newest-first, put assignments without due dates at the beginning
    return order === 'oldest-first' 
      ? [...assignmentsWithDueDate, ...assignmentsWithoutDueDate]
      : [...assignmentsWithoutDueDate, ...assignmentsWithDueDate];
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  return {
    assignments,
    loading,
    refreshing,
    handleRefresh,
    sortAssignments
  };
};
