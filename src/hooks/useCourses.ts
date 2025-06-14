
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
  term?: {
    id: number;
    name: string;
    start_at: string | null;
    end_at: string | null;
  };
}

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('current');

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

  const fetchFavoriteCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-favorite-courses', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.courses) {
        setFavoriteCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching favorite courses:', error);
    }
  };

  const isPastCourse = (course: Course): boolean => {
    const now = new Date();
    
    // Check term end date first
    if (course.term?.end_at) {
      const termEndDate = new Date(course.term.end_at);
      if (termEndDate < now) return true;
    }
    
    // Check course end date
    if (course.end_at) {
      const courseEndDate = new Date(course.end_at);
      if (courseEndDate < now) return true;
    }
    
    // Check workflow state for concluded courses
    if (course.workflow_state === 'completed' || course.workflow_state === 'concluded') {
      return true;
    }
    
    return false;
  };

  const isCurrentCourse = (course: Course): boolean => {
    return course.workflow_state === 'available' && !isPastCourse(course);
  };

  useEffect(() => {
    fetchCourses();
    fetchFavoriteCourses();
  }, [user]);

  useEffect(() => {
    let filtered = courses;
    
    if (filter === 'current') {
      filtered = courses.filter(course => isCurrentCourse(course));
    } else if (filter === 'past') {
      filtered = courses.filter(course => isPastCourse(course));
    } else if (filter === 'active') {
      filtered = courses.filter(course => course.workflow_state === 'available');
    } else if (filter === 'unpublished') {
      filtered = courses.filter(course => course.workflow_state === 'unpublished');
    } else if (filter === 'favorites') {
      filtered = favoriteCourses;
    }
    
    setFilteredCourses(filtered);
  }, [filter, courses, favoriteCourses]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
    fetchFavoriteCourses();
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
