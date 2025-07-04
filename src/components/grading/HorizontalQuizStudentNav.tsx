
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, User, CheckCircle2, Clock, BarChart3 } from 'lucide-react';

interface QuizSubmission {
  id: number;
  user_id: number;
  attempt: number;
  score: number | null;
  kept_score: number | null;
  workflow_state: string;
  started_at: string | null;
  finished_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    sortable_name: string;
  };
}

interface QuizQuestion {
  id: number;
  question_type: string;
  question_text: string;
  points_possible: number;
  question_name: string;
}

interface HorizontalQuizStudentNavProps {
  sortedSubmissions: QuizSubmission[];
  selectedSubmissionIndex: number;
  onSubmissionSelect: (index: number) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  gradedQuestions: {[submissionId: number]: Set<number>};
  manualGradingQuestions: QuizQuestion[];
}

const HorizontalQuizStudentNav: React.FC<HorizontalQuizStudentNavProps> = ({
  sortedSubmissions,
  selectedSubmissionIndex,
  onSubmissionSelect,
  onNavigate,
  gradedQuestions,
  manualGradingQuestions
}) => {
  const selectedSubmission = sortedSubmissions[selectedSubmissionIndex];

  const getGradingProgress = (submission: QuizSubmission) => {
    const totalQuestions = manualGradingQuestions.length;
    const gradedCount = gradedQuestions[submission.id]?.size || 0;
    const canvasGraded = submission.workflow_state === 'graded';
    
    // If Canvas says it's graded, then all questions are complete
    if (canvasGraded) {
      return { gradedCount: totalQuestions, totalQuestions, percentage: 100 };
    }
    
    return { 
      gradedCount, 
      totalQuestions, 
      percentage: totalQuestions > 0 ? (gradedCount / totalQuestions) * 100 : 0 
    };
  };

  const getSubmissionStatusColor = (submission: QuizSubmission) => {
    const progress = getGradingProgress(submission);
    
    if (submission.workflow_state === 'graded') {
      return 'bg-green-500'; // Fully graded
    } else if (progress.gradedCount > 0) {
      return 'bg-orange-500'; // Partially graded
    } else if (submission.workflow_state === 'complete' || submission.workflow_state === 'pending_review') {
      return 'bg-blue-500'; // Needs grading
    } else if (submission.workflow_state === 'untaken') {
      return 'bg-gray-400'; // Not taken
    } else {
      return 'bg-gray-400'; // Default
    }
  };

  const getStatusBadge = (submission: QuizSubmission) => {
    const progress = getGradingProgress(submission);
    
    if (submission.workflow_state === 'graded') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Graded
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>All questions graded - Status verified with Canvas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (progress.gradedCount > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Partially Graded ({progress.gradedCount}/{progress.totalQuestions})
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Some questions graded, more needed for Canvas completion</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (submission.workflow_state === 'complete' || submission.workflow_state === 'pending_review') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Needs Grading
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>No questions graded yet - {progress.totalQuestions} questions need grading</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (submission.workflow_state === 'untaken') {
      return <Badge variant="secondary" className="text-xs">Not Taken</Badge>;
    } else {
      return <Badge variant="outline" className="text-xs">{submission.workflow_state}</Badge>;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-6">
        {/* Left side - Navigation buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={selectedSubmissionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={selectedSubmissionIndex === sortedSubmissions.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Center - Student selector (now wider) */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <span className="text-sm text-gray-500 flex-shrink-0">
            {selectedSubmissionIndex + 1} of {sortedSubmissions.length}
          </span>
          <Select
            value={selectedSubmissionIndex.toString()}
            onValueChange={(value) => onSubmissionSelect(parseInt(value))}
          >
            <SelectTrigger className="w-96 min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-96">
              {sortedSubmissions.map((submission, index) => (
                <SelectItem key={submission.id} value={index.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSubmissionStatusColor(submission)}`} />
                      <span className="flex-1 text-left">{submission.user.sortable_name}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {getStatusBadge(submission)}
                      {submission.score !== null && (
                        <span className="text-xs text-gray-500">{submission.score} pts</span>
                      )}
                      {/* Show progress bar for partially graded submissions */}
                      {(() => {
                        const progress = getGradingProgress(submission);
                        return progress.gradedCount > 0 && submission.workflow_state !== 'graded' && (
                          <div className="w-12 flex items-center">
                            <Progress value={progress.percentage} className="h-1" />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right side - Current student info */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <User className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSubmissionStatusColor(selectedSubmission)}`} />
            <span className="font-medium text-gray-900">
              {selectedSubmission.user.name}
            </span>
            {getStatusBadge(selectedSubmission)}
            {selectedSubmission.score !== null && (
              <Badge variant="outline" className="text-xs">
                {selectedSubmission.score} pts
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalQuizStudentNav;
