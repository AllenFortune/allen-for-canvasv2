
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { useFavoriteCourses } from './useFavoriteCourses';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
}

export const useCourses = () => {
  const { user } = useAuth();
  const { favoriteCourses } = useFavoriteCourses();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-courses', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.courses) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    let filtered = courses;
    
    if (filter === 'active') {
      filtered = courses.filter(course => course.workflow_state === 'available');
    } else if (filter === 'unpublished') {
      filtered = courses.filter(course => course.workflow_state === 'unpublished');
    } else if (filter === 'favorites') {
      filtered = courses.filter(course => favoriteCourses.includes(course.id));
    }
    
    setFilteredCourses(filtered);
  }, [filter, courses, favoriteCourses]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  return {
    courses,
    filteredCourses,
    loading,
    refreshing,
    filter,
    setFilter,
    handleRefresh
  };
};
