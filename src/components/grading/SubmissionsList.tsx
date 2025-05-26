import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Assignment, Submission } from '@/types/grading';

interface SubmissionsListProps {
  submissions: Submission[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentSubmissionIndex: number;
  onSubmissionChange: (index: number) => void;
  assignment: Assignment | null;
}

const SubmissionsList: React.FC<SubmissionsListProps> = ({
  submissions,
  activeTab,
  setActiveTab,
  currentSubmissionIndex,
  onSubmissionChange,
  assignment
}) => {
  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.workflow_state === 'graded') {
      return <Badge className="bg-green-500 text-white">Graded</Badge>;
    } else if (submission.workflow_state === 'unsubmitted' || !submission.submitted_at) {
      return <Badge variant="outline" className="text-gray-500">Not Submitted</Badge>;
    } else if (submission.late) {
      return <Badge className="bg-yellow-500 text-white">Late</Badge>;
    } else if (submission.submitted_at) {
      return <Badge className="bg-blue-500 text-white">Submitted</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const filterSubmissions = () => {
    if (activeTab === 'all') {
      return submissions;
    } else if (activeTab === 'submitted') {
      // Show submissions that have been submitted but not yet graded
      return submissions.filter(s => s.submitted_at && s.workflow_state !== 'graded');
    } else if (activeTab === 'graded') {
      return submissions.filter(s => s.workflow_state === 'graded');
    } else if (activeTab === 'missing') {
      // Include students who haven't submitted
      return submissions.filter(s => !s.submitted_at || s.workflow_state === 'unsubmitted');
    }
    return submissions;
  };

  const filteredSubmissions = filterSubmissions();

  // Calculate counts for tab labels
  const submittedCount = submissions.filter(s => s.submitted_at && s.workflow_state !== 'graded').length;
  const gradedCount = submissions.filter(s => s.workflow_state === 'graded').length;
  const missingCount = submissions.filter(s => !s.submitted_at || s.workflow_state === 'unsubmitted').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Submissions ({submissions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
            <TabsTrigger value="submitted">
              Needs Grading ({submittedCount})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedCount})
            </TabsTrigger>
            <TabsTrigger value="missing">
              Missing ({missingCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">No submissions in this category.</p>
            </div>
          ) : (
            filteredSubmissions.map((submission, index) => {
              // Find the original index in the full submissions array
              const originalIndex = submissions.findIndex(s => s.id === submission.id);
              const isSelected = originalIndex === currentSubmissionIndex;
              
              return (
                <button
                  key={submission.id}
                  onClick={() => onSubmissionChange(originalIndex)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={submission.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {submission.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{submission.user.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getSubmissionStatusBadge(submission)}
                        {submission.workflow_state === 'graded' && submission.score !== null && (
                          <span className="text-xs text-gray-500">
                            {submission.score}/{assignment?.points_possible || '?'}
                          </span>
                        )}
                        {submission.submitted_at && (
                          <span className="text-xs text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionsList;
