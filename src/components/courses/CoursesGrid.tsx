
import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
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

interface CoursesGridProps {
  courses: Course[];
  filteredCourses: Course[];
  loading: boolean;
}

const CoursesGrid: React.FC<CoursesGridProps> = ({
  courses,
  filteredCourses,
  loading
}) => {
  const { user } = useAuth();
  const [gradingCounts, setGradingCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (filteredCourses.length > 0 && user) {
      fetchGradingCounts();
    }
  }, [filteredCourses, user]);

  const fetchGradingCounts = async () => {
    if (!user) return;

    const counts: Record<number, number> = {};
    
    // Only fetch grading counts for non-past courses
    const activeCourses = filteredCourses.filter(course => {
      const isPast = isPastCourse(course);
      return !isPast;
    });
    
    // Fetch grading counts for active courses only
    const promises = activeCourses.map(async (course) => {
      try {
        const { data, error } = await supabase.functions.invoke('get-canvas-assignments', {
          body: { courseId: course.id },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });
        
        if (!error && data.assignments) {
          const totalNeedsGrading = data.assignments.reduce(
            (total: number, assignment: any) => total + (assignment.needs_grading_count || 0),
            0
          );
          counts[course.id] = totalNeedsGrading;
        }
      } catch (error) {
        console.error(`Error fetching assignments for course ${course.id}:`, error);
        counts[course.id] = 0;
      }
    });

    await Promise.all(promises);
    setGradingCounts(counts);
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (!loading && filteredCourses.length === 0 && courses.length > 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No courses match the selected filter.</p>
      </div>
    );
  }

  if (!loading && courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No courses found. Make sure your Canvas integration is properly configured.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-gray-600">
        Showing {filteredCourses.length} of {courses.length} courses
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
