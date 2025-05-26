
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
  needs_grading_count: number;
  submission_types: string[];
}

interface AssignmentsListProps {
  assignments: Assignment[];
  assignmentsLoading: boolean;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ assignments, assignmentsLoading }) => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleGradeClick = (assignmentId: number) => {
    navigate(`/courses/${courseId}/assignments/${assignmentId}/grade`);
  };

  return (
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
              <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 relative">
                {assignment.needs_grading_count > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center z-10">
                    {assignment.needs_grading_count}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{assignment.name}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <span>Due: {formatDate(assignment.due_at)}</span>
                    <span>{assignment.points_possible || 0} points</span>
                    {assignment.needs_grading_count > 0 && (
                      <span className="text-red-600 font-medium">
                        {assignment.needs_grading_count} need grading
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={() => handleGradeClick(assignment.id)}
                >
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
  );
};

export default AssignmentsList;
