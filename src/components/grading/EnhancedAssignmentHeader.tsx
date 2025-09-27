
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, ExternalLink, ArrowLeft, Users, FileText } from 'lucide-react';
import { Assignment, Submission } from '@/types/grading';
import AssignmentGradingStatusCard from './AssignmentGradingStatusCard';
import VoiceControls from '@/components/VoiceControls';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface EnhancedAssignmentHeaderProps {
  courseId: string;
  assignment: Assignment | null;
  submissions: Submission[];
  voiceContext?: any;
}

const EnhancedAssignmentHeader: React.FC<EnhancedAssignmentHeaderProps> = ({ 
  courseId, 
  assignment,
  submissions,
  voiceContext
}) => {
  const navigate = useNavigate();

  if (!assignment) {
    return (
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const gradedCount = submissions.filter(s => s.grade !== null && s.grade !== undefined && s.grade !== '').length;
  const submittedCount = submissions.filter(s => s.submitted_at).length;
  const totalSubmissions = submissions.length;

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb and Navigation */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button 
              onClick={() => navigate(`/courses/${courseId}`)}
              className="hover:text-gray-700 transition-colors"
            >
              Course
            </button>
            <span>/</span>
            <span>Grade Assignment</span>
          </div>
          
          {/* Voice Controls in top-right */}
          <VoiceControls context={voiceContext} />
        </div>

        <div className="flex items-center gap-4 mb-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{assignment.name}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due {formatDate(assignment.due_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span>{assignment.points_possible} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{totalSubmissions} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{submittedCount} submitted</span>
                </div>
              </div>
            </div>

            {assignment.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Assignment Instructions</h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(assignment.description) }}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in Canvas
                </a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <AssignmentGradingStatusCard 
              assignment={assignment}
              submissions={submissions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAssignmentHeader;
