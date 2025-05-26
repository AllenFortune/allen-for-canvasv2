
import React from 'react';
import CourseCard from './CourseCard';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
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
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </>
  );
};

export default CoursesGrid;
