
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Clock, MessageSquare, Users } from 'lucide-react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';

interface EnhancedDiscussionHeaderProps {
  courseId: string;
  discussion: Discussion | null;
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
}

const EnhancedDiscussionHeader: React.FC<EnhancedDiscussionHeaderProps> = ({ 
  courseId, 
  discussion,
  entries,
  grades
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

  const uniqueStudents = entries.reduce((acc, entry) => {
    if (!acc.find(student => student.user_id === entry.user_id)) {
      acc.push({ user_id: entry.user_id, name: entry.user.name });
    }
    return acc;
  }, [] as { user_id: number; name: string }[]);

  const gradedCount = grades.filter(g => g.grade !== null).length;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button 
            onClick={() => navigate(`/courses/${courseId}`)}
            className="hover:text-gray-700 transition-colors"
          >
            Course
          </button>
          <span>/</span>
          <span>Grade Discussion</span>
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
              {discussion?.title || 'Loading Discussion...'}
            </h1>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Posted: {formatDate(discussion?.posted_at)}
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {discussion?.points_possible || 0} points
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {gradedCount}/{uniqueStudents.length} graded
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              {uniqueStudents.length > 0 ? ((gradedCount / uniqueStudents.length) * 100).toFixed(0) : 0}% Complete
            </Badge>
            {discussion && (
              <Button variant="outline" size="sm" asChild>
                <a href={discussion.html_url} target="_blank" rel="noopener noreferrer">
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

export default EnhancedDiscussionHeader;
