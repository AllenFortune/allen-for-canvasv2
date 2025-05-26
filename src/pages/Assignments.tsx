
import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, RefreshCw, Users } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  course_name: string;
  due_at: string | null;
  points_possible: number;
  needs_grading_count: number;
  submissions_count: number;
}

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-assignments');
      
      if (error) throw error;
      
      if (data.assignments) {
        // Filter only assignments that need grading
        const needsGrading = data.assignments.filter((assignment: Assignment) => 
          assignment.needs_grading_count > 0
        );
        setAssignments(needsGrading);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Needs Grading</h1>
                <p className="text-xl text-gray-600">View all assignments that need grading</p>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="bg-gray-900 hover:bg-gray-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Assignments
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading assignments...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{assignment.name}</CardTitle>
                          <p className="text-gray-600 text-sm">{assignment.course_name}</p>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                            {assignment.needs_grading_count} need grading
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            Due: {formatDate(assignment.due_at)}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            {assignment.points_possible} points possible
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2" />
                            {assignment.submissions_count} total submissions
                          </div>
                        </div>
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                          Start Grading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && assignments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No assignments need grading at this time.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Assignments;
