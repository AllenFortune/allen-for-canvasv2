
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import CourseHeader from '@/components/course-detail/CourseHeader';
import CourseInfoCards from '@/components/course-detail/CourseInfoCards';
import GradingAlert from '@/components/course-detail/GradingAlert';
import CourseDetailTabs from '@/components/course-detail/CourseDetailTabs';
import CourseDetailLoadingError from '@/components/course-detail/CourseDetailLoadingError';
import { useCourseData } from '@/hooks/useCourseData';
import { useCourseContent } from '@/hooks/useCourseContent';
import { useQuizSubmissionsData } from '@/hooks/useQuizSubmissionsData';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error } = useCourseData(courseId);
  const {
    assignments,
    discussions,
    quizzes,
    assignmentsLoading,
    discussionsLoading,
    quizzesLoading
  } = useCourseContent(courseId);

  // Add quiz submissions data hook
  const quizIds = quizzes.map(quiz => quiz.id);
  const { submissionsMap: quizSubmissionsMap, loading: quizSubmissionsLoading } = useQuizSubmissionsData(courseId, quizIds);

  console.log('CourseDetail component loaded with courseId:', courseId);

  // Calculate total grading count including quiz submissions
  const assignmentsNeedingGrading = assignments.reduce((total, assignment) => total + assignment.needs_grading_count, 0);
  const discussionsNeedingGrading = discussions.reduce((total, discussion) => total + (discussion.needs_grading_count || 0), 0);
  const quizzesNeedingGrading = Object.values(quizSubmissionsMap).reduce((total, submission: any) => {
    return total + (submission?.needsGrading || 0);
  }, 0);

  const totalNeedsGrading = assignmentsNeedingGrading + discussionsNeedingGrading + quizzesNeedingGrading;
  const totalUnread = discussions.reduce((total, discussion) => total + discussion.unread_count, 0);

  console.log('Grading counts:', {
    assignmentsNeedingGrading,
    discussionsNeedingGrading,
    quizzesNeedingGrading,
    totalNeedsGrading
  });

  if (loading) {
    return <CourseDetailLoadingError type="loading" />;
  }

  if (error || !course) {
    return <CourseDetailLoadingError type="error" error={error || 'Course not found'} />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <CourseHeader course={course} />
            <CourseInfoCards course={course} />
            <GradingAlert totalNeedsGrading={totalNeedsGrading} />
            <CourseDetailTabs 
              assignments={assignments}
              assignmentsLoading={assignmentsLoading}
              discussions={discussions}
              discussionsLoading={discussionsLoading}
              quizzes={quizzes}
              quizzesLoading={quizzesLoading}
              totalNeedsGrading={totalNeedsGrading}
              totalUnread={totalUnread}
              courseId={courseId}
              quizSubmissionsMap={quizSubmissionsMap}
              quizSubmissionsLoading={quizSubmissionsLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetail;
