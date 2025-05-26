
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  html_url: string;
}

interface GradeAssignmentHeaderProps {
  courseId: string;
  assignment: Assignment | null;
}

const GradeAssignmentHeader: React.FC<GradeAssignmentHeaderProps> = ({ 
  courseId, 
  assignment 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4 mb-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course
      </Button>
      <h1 className="text-3xl font-bold text-gray-900">Grade Assignment</h1>
      {assignment && (
        <Button variant="outline" asChild>
          <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Canvas
          </a>
        </Button>
      )}
    </div>
  );
};

export default GradeAssignmentHeader;
