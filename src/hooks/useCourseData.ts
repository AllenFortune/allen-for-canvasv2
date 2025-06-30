
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Course, getCachedSession, withRetry } from '@/utils/courseUtils';

export const useCourseData = (courseId: string | undefined) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && isNaN(parseInt(courseId))) {
      console.error('Invalid courseId provided:', courseId);
      setError(`Invalid course ID: "${courseId}". Please check the URL and try again.`);
      setLoading(false);
      return;
    }

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);
      setError(null);
      
      const parsedCourseId = parseInt(courseId);
      console.log(`Fetching details for course ${parsedCourseId}`);
      
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        throw new Error('No valid session');
      }

      // First try to fetch the course directly by ID
      try {
        console.log('Attempting direct course fetch...');
        const { data, error } = await withRetry(() =>
          supabase.functions.invoke('get-canvas-course-by-id', {
            body: { courseId: parsedCourseId },
            headers: {
              Authorization: `Bearer ${sessionResult.data.session.access_token}`,
            },
          })
        );
        
        if (!error && data?.success && data.course) {
          console.log(`✓ Found course via direct fetch: ${data.course.name} (ID: ${data.course.id})`);
          setCourse(data.course);
          return;
        } else {
          console.log('Direct course fetch failed:', error || 'No course data received');
        }
      } catch (directError: any) {
        console.warn('Direct course fetch error:', directError);
        if (directError.message?.includes('404') || directError.message?.includes('not found')) {
          setError(`Course with ID ${courseId} was not found. This could mean:
          • The course doesn't exist or has been deleted
          • You don't have access to this course
          • The course is in a different Canvas instance
          
          Please check the course URL and your Canvas permissions.`);
          return;
        }
      }

      // Fallback: fetch all courses and search
      console.log('Trying fallback method - fetching all courses...');
      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-courses', {
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) {
        console.error('Fallback fetch error:', error);
        throw error;
      }
      
      if (data.courses) {
        const foundCourse = data.courses.find((c: Course) => c.id === parsedCourseId);
        if (foundCourse) {
          console.log(`✓ Found course via fallback: ${foundCourse.name} (ID: ${foundCourse.id})`);
          setCourse(foundCourse);
        } else {
          console.warn(`Course ${courseId} not found in ${data.courses.length} courses`);
          setError(`Course with ID ${courseId} was not found. This could mean:
          • The course doesn't exist or has been deleted
          • You don't have access to this course
          • The course is in a different Canvas instance
          
          Please check the course URL and your Canvas permissions.`);
        }
      } else {
        console.error('No courses data received from Canvas');
        setError('Unable to load course data from Canvas. Please check your Canvas connection and try again.');
      }
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      if (error.message?.includes('Canvas credentials not configured')) {
        setError('Canvas credentials are not configured. Please go to Settings to set up your Canvas integration.');
      } else if (error.message?.includes('Invalid authentication')) {
        setError('Authentication failed. Please try signing out and signing back in.');
      } else {
        setError('Failed to load course details. Please check your Canvas connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { course, loading, error };
};
