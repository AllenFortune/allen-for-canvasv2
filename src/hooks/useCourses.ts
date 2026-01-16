
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Course, filterCourses, getCachedSession, clearSessionCache, withRetry } from '@/utils/courseUtils';

export const useCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [favoriteCourses, setFavoriteCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('active');
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (retryOnAuthError = true): Promise<Course[]> => {
    if (!user) {
      setLoading(false);
      return [];
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
      
      // Check for auth errors (401/400 with auth message)
      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const isAuthError = errorMessage.includes('auth') || 
                           errorMessage.includes('401') || 
                           errorMessage.includes('invalid') ||
                           errorMessage.includes('session');
        
        if (isAuthError && retryOnAuthError) {
          console.log('Auth error detected, clearing cache and retrying...');
          clearSessionCache();
          
          // Try to refresh the session
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            console.log('Session refreshed, retrying fetch...');
            return fetchCourses(false); // Retry once without further retries
          }
        }
        throw error;
      }
      
      if (data.courses) {
        console.log(`Successfully loaded ${data.courses.length} courses`);
        setCourses(data.courses);
        return data.courses;
      }
      return [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try signing out and back in.');
      return [];
    }
  }, [user]);

  const fetchFavoriteCourses = useCallback(async (retryOnAuthError = true): Promise<Course[]> => {
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
      
      // Check for auth errors and retry once
      if (error) {
        const errorMessage = error.message?.toLowerCase() || '';
        const isAuthError = errorMessage.includes('auth') || 
                           errorMessage.includes('401') || 
                           errorMessage.includes('invalid') ||
                           errorMessage.includes('session');
        
        if (isAuthError && retryOnAuthError) {
          console.log('Auth error on favorites, clearing cache and retrying...');
          clearSessionCache();
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData.session) {
            return fetchFavoriteCourses(false);
          }
        }
        throw error;
      }
      
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
