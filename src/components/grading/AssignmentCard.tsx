
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, AlertCircle } from 'lucide-react';

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

interface AssignmentCardProps {
  assignment: Assignment;
  onStartGrading: (assignment: Assignment) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onStartGrading }) => {
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

  const dueDate = formatDate(assignment.due_at);
  const overdue = isOverdue(assignment.due_at);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
            onClick={() => onStartGrading(assignment)}
          >
            Start Grading
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
