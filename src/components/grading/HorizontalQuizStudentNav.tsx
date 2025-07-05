
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, User, CheckCircle2, Clock } from 'lucide-react';

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
  localGradingState?: {[submissionId: number]: {[questionId: number]: boolean}};
  questions: QuizQuestion[];
}

const HorizontalQuizStudentNav: React.FC<HorizontalQuizStudentNavProps> = ({
  sortedSubmissions,
  selectedSubmissionIndex,
  onSubmissionSelect,
  onNavigate,
  localGradingState = {},
  questions
}) => {
  const selectedSubmission = sortedSubmissions[selectedSubmissionIndex];

  // Get manual grading questions that require human review
  const manualGradingQuestions = questions.filter(q => 
    q.question_type === 'essay_question' || 
    q.question_type === 'fill_in_multiple_blanks_question' ||
    q.question_type === 'file_upload_question'
  );

  // Smart status logic that considers both Canvas state and local grading state
  const getSmartSubmissionStatus = (submission: QuizSubmission) => {
    // If Canvas shows graded, use that
    if (submission.workflow_state === 'graded') {
      return 'graded';
    }

    // If there are no manual questions, no grading needed
    if (manualGradingQuestions.length === 0) {
      return submission.workflow_state;
    }

    // Check if all manual questions are graded locally
    const localState = localGradingState[submission.id] || {};
    const allManualQuestionsGraded = manualGradingQuestions.every(q => localState[q.id]);
    
    if (allManualQuestionsGraded) {
      return 'graded_local';
    }

    return submission.workflow_state;
  };

  const getSubmissionStatusColor = (submission: QuizSubmission) => {
    const smartStatus = getSmartSubmissionStatus(submission);
    
    switch (smartStatus) {
      case 'complete':
      case 'pending_review':
        return 'bg-blue-500'; // Needs grading
      case 'graded':
      case 'graded_local':
        return 'bg-green-500'; // Graded
      case 'untaken':
        return 'bg-gray-400'; // Not taken
      default:
        return 'bg-gray-400'; // Default
    }
  };

  const getStatusBadge = (submission: QuizSubmission) => {
    const smartStatus = getSmartSubmissionStatus(submission);
    
    switch (smartStatus) {
      case 'graded':
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
                <p>Status verified with Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'graded_local':
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Graded (Local)
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>All questions graded locally, syncing with Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'complete':
      case 'pending_review':
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
                <p>Requires manual grading</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      case 'untaken':
        return <Badge variant="secondary" className="text-xs">Not Taken</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{submission.workflow_state}</Badge>;
    }
  };

  const getSelectItemStatusBadge = (submission: QuizSubmission) => {
    const smartStatus = getSmartSubmissionStatus(submission);
    
    switch (smartStatus) {
      case 'graded':
      case 'graded_local':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {smartStatus === 'graded_local' ? 'Graded (Local)' : 'Graded'}
          </Badge>
        );
      case 'complete':
      case 'pending_review':
        return (
          <Badge variant="destructive" className="text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Needs Grading
          </Badge>
        );
      case 'untaken':
        return <Badge variant="secondary" className="text-xs">Not Taken</Badge>;
      default:
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
                      {getSelectItemStatusBadge(submission)}
                      {submission.score !== null && (
                        <span className="text-xs text-gray-500">{submission.score} pts</span>
                      )}
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
