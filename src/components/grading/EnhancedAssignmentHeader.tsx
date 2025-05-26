
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, FileText, Users } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';

interface EnhancedAssignmentHeaderProps {
  courseId: string;
  assignment: Assignment | null;
  submissions: Submission[];
}

const EnhancedAssignmentHeader: React.FC<EnhancedAssignmentHeaderProps> = ({ 
  courseId, 
  assignment,
  submissions
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const gradedCount = submissions.filter(s => s.workflow_state === 'graded').length;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="hover:text-gray-700 transition-colors"
          >
            Course
          </button>
          <span>/</span>
          <span>Grade Assignment</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {assignment?.name || 'Loading Assignment...'}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Due: {formatDate(assignment?.due_at)}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {assignment?.points_possible || 0} points
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {gradedCount}/{submissions.length} graded
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              {((gradedCount / submissions.length) * 100).toFixed(0)}% Complete
            </Badge>
            {assignment && (
              <Button variant="outline" size="sm" asChild>
                <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Canvas
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssignmentHeader;
