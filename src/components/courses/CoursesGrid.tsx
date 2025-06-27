
import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import { useAuth } from "@/contexts/AuthContext";
import { Course, isPastCourse, getCachedSession, withRetry } from '@/utils/courseUtils';
import { supabase } from '@/integrations/supabase/client';

interface CoursesGridProps {
  courses: Course[];
  filteredCourses: Course[];
  loading: boolean;
  error?: string | null;
}

const CoursesGrid: React.FC<CoursesGridProps> = ({
  courses,
  filteredCourses,
  loading,
  error
}) => {
  const { user } = useAuth();
  const [gradingCounts, setGradingCounts] = useState<Record<number, number>>({});
  const [gradingCountsLoading, setGradingCountsLoading] = useState(false);

  useEffect(() => {
    if (filteredCourses.length > 0 && user && !loading) {
      fetchGradingCounts();
    }
  }, [filteredCourses, user, loading]);

  const fetchGradingCounts = async () => {
    if (!user) return;

    setGradingCountsLoading(true);
    const counts: Record<number, number> = {};
    
    // Only fetch grading counts for non-past courses to improve performance
    const activeCourses = filteredCourses.filter(course => !isPastCourse(course));
    
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for grading counts');
        setGradingCountsLoading(false);
        return;
      }

      // Fetch grading counts for active courses with retry logic
      const promises = activeCourses.map(async (course) => {
        try {
          const { data, error } = await withRetry(() =>
            supabase.functions.invoke('get-canvas-assignments', {
              body: { courseId: course.id },
              headers: {
                Authorization: `Bearer ${sessionResult.data.session.access_token}`,
              },
            })
          );
          
          if (!error && data.assignments) {
            const totalNeedsGrading = data.assignments.reduce(
              (total: number, assignment: any) => total + (assignment.needs_grading_count || 0),
              0
            );
            counts[course.id] = totalNeedsGrading;
          } else {
            counts[course.id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching assignments for course ${course.id}:`, error);
          counts[course.id] = 0;
        }
      });

      await Promise.all(promises);
      setGradingCounts(counts);
    } catch (error) {
      console.error('Error fetching grading counts:', error);
    } finally {
      setGradingCountsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!loading && filteredCourses.length === 0 && courses.length > 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-600">No courses match the selected filter.</p>
          <p className="text-blue-500 text-sm mt-2">Try selecting a different filter or refreshing your courses.</p>
        </div>
      </div>
    );
  }

  if (!loading && courses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700 mb-2">No courses found.</p>
          <p className="text-yellow-600 text-sm">Make sure your Canvas integration is properly configured.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center text-gray-600">
        <span>Showing {filteredCourses.length} of {courses.length} courses</span>
        {gradingCountsLoading && (
          <span className="text-sm text-gray-500">Loading grading info...</span>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            needsGradingCount={gradingCounts[course.id] || 0}
          />
        ))}
      </div>
    </>
  );
};

export default CoursesGrid;
