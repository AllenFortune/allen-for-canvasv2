
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

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
}

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
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [discussionsLoading, setDiscussionsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchAssignments();
      fetchDiscussions();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    if (!user || !courseId) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-courses', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.courses) {
        const foundCourse = data.courses.find((c: Course) => c.id === parseInt(courseId));
        setCourse(foundCourse || null);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    if (!user || !courseId) return;

    setAssignmentsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-assignments', {
        body: { courseId: parseInt(courseId) },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.assignments) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    if (!user || !courseId) return;

    setDiscussionsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-discussions', {
        body: { courseId: parseInt(courseId) },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.discussions) {
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setDiscussionsLoading(false);
    }
  };

  const totalNeedsGrading = assignments.reduce((total, assignment) => total + assignment.needs_grading_count, 0);
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

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-8">
                <p className="text-gray-600">Course not found.</p>
                <Link to="/courses">
                  <Button className="mt-4">Back to Courses</Button>
                </Link>
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
              totalNeedsGrading={totalNeedsGrading}
              totalUnread={totalUnread}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetail;
