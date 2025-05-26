
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, Users } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number | null;
}

interface AssignmentDetailsCardProps {
  assignment: Assignment | null;
  submissionsCount: number;
}

const AssignmentDetailsCard: React.FC<AssignmentDetailsCardProps> = ({ 
  assignment, 
  submissionsCount 
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{assignment?.name}</h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Due: {formatDate(assignment?.due_at)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {assignment?.points_possible || 0} points
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {submissionsCount} submissions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentDetailsCard;
