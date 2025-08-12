
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Users, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  submission_types: string[];
}

interface AssignmentDetailsCardProps {
  assignment: Assignment | null;
  submissionsCount: number;
}

const AssignmentDetailsCard: React.FC<AssignmentDetailsCardProps> = ({ 
  assignment, 
  submissionsCount 
}) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

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

  const formatSubmissionTypes = (types: string[] | undefined) => {
    if (!types || types.length === 0) return 'Not specified';
    return types.map(type => {
      switch (type) {
        case 'online_text_entry': return 'Text Entry';
        case 'online_upload': return 'File Upload';
        case 'online_url': return 'URL';
        case 'media_recording': return 'Media Recording';
        default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }).join(', ');
  };

  // Enhanced description validation
  const hasDescription = assignment?.description && 
    assignment.description.trim() !== '' && 
    assignment.description !== '<p></p>' &&
    assignment.description !== '<p>&nbsp;</p>' &&
    assignment.description !== '<br>' &&
    assignment.description !== '<br/>';

  // Clean HTML content for display
  const cleanDescription = (html: string) => {
    if (!html) return '';
    // Remove empty paragraphs and break tags
    return html
      .replace(/<p>\s*<\/p>/g, '')
      .replace(/<p>&nbsp;<\/p>/g, '')
      .replace(/<br\s*\/?>/g, '')
      .trim();
  };

  console.log('Assignment description in component:', assignment?.description);
  console.log('Has description after validation:', hasDescription);

  if (!assignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Assignment data not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-3">{assignment.name}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              Due: {formatDate(assignment.due_at)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              {assignment.points_possible || 0} points
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {submissionsCount} submissions
            </div>
          </div>

          <div className="mt-3 pt-3 border-t">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Submission Types: </span>
              <span className="text-gray-600">{formatSubmissionTypes(assignment.submission_types)}</span>
            </div>
          </div>

          {hasDescription && (
            <div className="mt-4">
              <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto font-medium text-sm hover:bg-transparent">
                    <span className="mr-2">Assignment Description</span>
                    {isDescriptionOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md prose prose-sm max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(cleanDescription(assignment.description)) 
                      }} 
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {!hasDescription && (
            <div className="mt-4 text-sm text-gray-500 italic border-l-4 border-gray-200 pl-3">
              No description provided for this assignment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentDetailsCard;
