
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Course, filterCourses, getCachedSession, withRetry } from '@/utils/courseUtils';

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('current');
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching courses...');
      setError(null);
      
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        throw new Error('No valid session');
      }

      const { data, error } = await withRetry(() => 
        supabase.functions.invoke('get-canvas-courses', {
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.courses) {
        console.log(`Successfully loaded ${data.courses.length} courses`);
        setCourses(data.courses);
        return data.courses;
      }
      return [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try refreshing.');
      return [];
    }
  }, [user]);

  const fetchFavoriteCourses = useCallback(async () => {
    if (!user) return [];

    try {
      console.log('Fetching favorite courses...');
      
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        throw new Error('No valid session');
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-favorite-courses', {
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.courses) {
        console.log(`Successfully loaded ${data.courses.length} favorite courses`);
        setFavoriteCourses(data.courses);
        return data.courses;
      }
      return [];
    } catch (error) {
      console.error('Error fetching favorite courses:', error);
      // Don't set error state for favorites as it's not critical
      return [];
    }
  }, [user]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setRefreshing(false);
    
    try {
      // Load both courses and favorites concurrently
      const [coursesResult, favoritesResult] = await Promise.all([
        fetchCourses(),
        fetchFavoriteCourses()
      ]);
      
      // Apply filtering with the fresh data
      const filtered = filterCourses(coursesResult, favoritesResult, filter);
      setFilteredCourses(filtered);
      
    } catch (error) {
      console.error('Error loading course data:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [fetchCourses, fetchFavoriteCourses, filter]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [user]);

  // Filter courses when filter changes (but only if we have data)
  useEffect(() => {
    if (!loading && courses.length > 0) {
      console.log(`Applying filter: ${filter}`);
      const filtered = filterCourses(courses, favoriteCourses, filter);
      console.log(`Filter result: ${filtered.length} courses`);
      setFilteredCourses(filtered);
    }
  }, [filter, courses, favoriteCourses, loading]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => {
      setRefreshing(false);
    });
  }, [loadAllData]);

  return {
    courses,
    filteredCourses,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    handleRefresh
  };
};
