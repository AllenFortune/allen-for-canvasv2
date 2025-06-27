
import React from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseFilters from "@/components/courses/CourseFilters";
import CoursesGrid from "@/components/courses/CoursesGrid";
import { useCourses } from "@/hooks/useCourses";

const Courses = () => {
  const {
    courses,
    filteredCourses,
    loading,
    refreshing,
    error,
    filter,
    setFilter,
    handleRefresh
  } = useCourses();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Courses</h1>
                <p className="text-xl text-gray-600">Manage your Canvas courses</p>
              </div>
              <CourseFilters
                filter={filter}
                setFilter={setFilter}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                error={error}
              />
            </div>

            <CoursesGrid
              courses={courses}
              filteredCourses={filteredCourses}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Courses;
