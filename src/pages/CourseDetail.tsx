
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, Users, ExternalLink, Calendar, AlertCircle } from 'lucide-react';

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

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchAssignments();
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDateRange = (startAt: string | null, endAt: string | null) => {
    if (!startAt && !endAt) return 'No dates set';
    if (!startAt) return `Ends ${formatDate(endAt)}`;
    if (!endAt) return `Started ${formatDate(startAt)}`;
    return `${formatDate(startAt)} - ${formatDate(endAt)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-600 text-white';
      case 'unpublished':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Active';
      case 'unpublished':
        return 'Unpublished';
      default:
        return status;
    }
  };

  const totalNeedsGrading = assignments.reduce((total, assignment) => total + assignment.needs_grading_count, 0);

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
            {/* Header with back button */}
            <div className="mb-8">
              <Link to="/courses" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Link>
              
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(course.workflow_state)}`}>
                      {getStatusLabel(course.workflow_state)}
                    </span>
                  </div>
                  <p className="text-gray-600">{course.course_code}</p>
                </div>
                
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Canvas
                </Button>
              </div>
            </div>

            {/* Course Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Term</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">No term assigned</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {getDateRange(course.start_at, course.end_at)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {course.total_students > 0 ? `${course.total_students} students` : 'Unknown students'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Needs Grading Alert */}
            {totalNeedsGrading > 0 && (
              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <p className="text-orange-800">
                      You have <strong>{totalNeedsGrading}</strong> {totalNeedsGrading === 1 ? 'item' : 'items'} that need grading in this course.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="assignments" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="assignments" className="relative">
                  Assignments
                  {totalNeedsGrading > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalNeedsGrading}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assignments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <p className="text-gray-600">Manage and grade assignments for this course</p>
                  </CardHeader>
                  <CardContent>
                    {assignmentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading assignments...</p>
                      </div>
                    ) : assignments.length > 0 ? (
                      <div className="space-y-4">
                        {assignments.map((assignment) => (
                          <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{assignment.name}</h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <span>Due: {formatDate(assignment.due_at)}</span>
                                <span>{assignment.points_possible || 0} points</span>
                              </div>
                            </div>
                            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                              Grade
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">No assignments found for this course.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussions">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center py-8">Discussions feature coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="quizzes">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center py-8">Quizzes feature coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="students">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center py-8">Students feature coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center py-8">Analytics feature coming soon.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CourseDetail;
