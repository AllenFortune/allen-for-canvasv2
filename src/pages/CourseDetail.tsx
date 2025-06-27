
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import CourseHeader from '@/components/course-detail/CourseHeader';
import CourseInfoCards from '@/components/course-detail/CourseInfoCards';
import GradingAlert from '@/components/course-detail/GradingAlert';
import CourseDetailTabs from '@/components/course-detail/CourseDetailTabs';
import { Course, getCachedSession, withRetry } from '@/utils/courseUtils';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  needs_grading_count: number;
  submission_types: string[];
}

interface Discussion {
  id: number;
  title: string;
  posted_at: string | null;
  discussion_type: string;
  unread_count: number;
  todo_date: string | null;
  needs_grading_count?: number;
  graded_count?: number;
  total_submissions?: number;
  assignment_id?: number;
  is_assignment?: boolean;
}

interface Quiz {
  id: number;
  title: string;
  due_at: string | null;
  points_possible: number | null;
  quiz_type: string;
  time_limit: number | null;
  allowed_attempts: number | null;
  published: boolean;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('CourseDetail component loaded with courseId:', courseId);

  // Validate courseId before proceeding
  useEffect(() => {
    if (courseId && isNaN(parseInt(courseId))) {
      console.error('Invalid courseId provided:', courseId);
      setError(`Invalid course ID: "${courseId}". Please check the URL and try again.`);
      setLoading(false);
      return;
    }

    if (courseId) {
      fetchCourseDetails();
      fetchAssignments();
      fetchDiscussions();
      fetchQuizzes();
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
        // If it's a 404, we know the course doesn't exist or user doesn't have access
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

  const fetchAssignments = async () => {
    if (!user || !courseId) return;

    setAssignmentsLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for assignments');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-assignments', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.assignments) {
        setAssignments(data.assignments);
        console.log(`Loaded ${data.assignments.length} assignments`);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Don't set error state for individual components, just log
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    if (!user || !courseId) return;

    setDiscussionsLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for discussions');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-discussions', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.discussions) {
        setDiscussions(data.discussions);
        console.log(`Loaded ${data.discussions.length} discussions`);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    if (!user || !courseId) return;

    setQuizzesLoading(true);
    try {
      const sessionResult = await getCachedSession();
      if (!sessionResult.data.session?.access_token) {
        console.warn('No valid session for quizzes');
        return;
      }

      const { data, error } = await withRetry(() =>
        supabase.functions.invoke('get-canvas-quizzes', {
          body: { courseId: parseInt(courseId) },
          headers: {
            Authorization: `Bearer ${sessionResult.data.session.access_token}`,
          },
        })
      );
      
      if (error) throw error;
      
      if (data.quizzes) {
        setQuizzes(data.quizzes);
        console.log(`Loaded ${data.quizzes.length} quizzes`);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const totalNeedsGrading = assignments.reduce((total, assignment) => total + assignment.needs_grading_count, 0) + 
                           discussions.reduce((total, discussion) => total + (discussion.needs_grading_count || 0), 0);
  const totalUnread = discussions.reduce((total, discussion) => total + discussion.unread_count, 0);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading course details...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-4">Course Not Found</h3>
                  <div className="text-red-600 mb-6 text-left whitespace-pre-line">
                    {error || 'Course not found'}
                  </div>
                  <div className="space-y-3">
                    <Link to="/courses">
                      <Button className="w-full">Back to Courses</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()}
                      className="w-full"
                    >
                      Try Again
                    </Button>
                    {error?.includes('Canvas credentials') && (
                      <Link to="/settings">
                        <Button variant="outline" className="w-full">
                          Configure Canvas Settings
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetail;
