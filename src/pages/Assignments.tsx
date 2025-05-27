
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssignmentsLoadingDisplay from "@/components/grading/AssignmentsLoadingDisplay";
import { useAllAssignments } from "@/hooks/useAllAssignments";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, FileText, RefreshCw, Calendar, AlertCircle } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  course_code: string;
  due_at: string | null;
  points_possible: number;
  needs_grading_count: number;
  html_url: string;
}

type SortOrder = 'oldest-first' | 'newest-first';

const Assignments = () => {
  const navigate = useNavigate();
  const { assignments, loading, refreshing, handleRefresh, sortAssignments } = useAllAssignments();
  const [sortedAssignments, setSortedAssignments] = useState<Assignment[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest-first');

  useEffect(() => {
    setSortedAssignments(sortAssignments(assignments, sortOrder));
  }, [assignments, sortOrder, sortAssignments]);

  const handleStartGrading = (assignment: Assignment) => {
    navigate(`/courses/${assignment.course_id}/assignments/${assignment.id}/grade`);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return <AssignmentsLoadingDisplay />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Needs Grading</h1>
                <p className="text-xl text-gray-600">
                  {sortedAssignments.length} assignments need grading across all courses
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by due date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oldest-first">Oldest First</SelectItem>
                    <SelectItem value="newest-first">Newest First</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleRefresh} 
                  disabled={refreshing}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {sortedAssignments.map((assignment) => {
                const dueDate = formatDate(assignment.due_at);
                const overdue = isOverdue(assignment.due_at);
                
                return (
                  <Card key={`${assignment.course_id}-${assignment.id}`} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{assignment.name}</CardTitle>
                          <p className="text-gray-600 text-sm font-medium">{assignment.course_name}</p>
                          <p className="text-gray-500 text-xs">{assignment.course_code}</p>
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
                            {dueDate ? (
                              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                                Due: {dueDate}
                                {overdue && <span className="ml-1">(Overdue)</span>}
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-500">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                No due date
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <FileText className="w-4 h-4 mr-2" />
                            {assignment.points_possible || 0} points possible
                          </div>
                        </div>
                        <Button 
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                          onClick={() => handleStartGrading(assignment)}
                        >
                          Start Grading
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {sortedAssignments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No assignments need grading at this time.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later or refresh to see new submissions.</p>
              </div>
            )}

            {sortedAssignments.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                Showing {sortedAssignments.length} assignments that need grading, sorted by{' '}
                {sortOrder === 'oldest-first' ? 'oldest first' : 'newest first'}
                {sortOrder === 'oldest-first' && (
                  <span className="block mt-1">Assignments without due dates are shown last</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Assignments;
