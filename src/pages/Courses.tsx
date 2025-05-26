
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Users, RefreshCw, Filter } from 'lucide-react';

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
}

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-courses', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.courses) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  useEffect(() => {
    let filtered = courses;
    
    if (filter === 'active') {
      filtered = courses.filter(course => course.workflow_state === 'available');
    } else if (filter === 'unpublished') {
      filtered = courses.filter(course => course.workflow_state === 'unpublished');
    }
    
    setFilteredCourses(filtered);
  }, [filter, courses]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No dates set';
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh Courses
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  Showing {filteredCourses.length} of {courses.length} courses
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(course.workflow_state)}`}>
                            {getStatusLabel(course.workflow_state)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{course.course_code}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            {getDateRange(course.start_at, course.end_at)}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2" />
                            {course.total_students > 0 ? `${course.total_students} students` : 'Unknown students'}
                          </div>
                          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-4">
                            View Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {!loading && filteredCourses.length === 0 && courses.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No courses match the selected filter.</p>
              </div>
            )}

            {!loading && courses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No courses found. Make sure your Canvas integration is properly configured.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Courses;
