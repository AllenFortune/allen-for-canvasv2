
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Discussion, DiscussionGrade, DiscussionSubmission } from '@/types/grading';
import GradeInput from './GradeInput';
import FeedbackInput from './FeedbackInput';
import AIGradingSection from './AIGradingSection';
import ActionButtons from './ActionButtons';

interface DiscussionGradingSectionProps {
  discussion: Discussion;
  gradeInput: string;
  setGradeInput: (value: string) => void;
  feedbackInput: string;
  setFeedbackInput: (value: string) => void;
  currentGrade: DiscussionGrade | undefined;
  currentSubmission?: DiscussionSubmission;
  isSummativeAssessment: boolean;
  setIsSummativeAssessment: (value: boolean) => void;
  useRubricForAI: boolean;
  setUseRubricForAI: (value: boolean) => void;
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  onAIGrading: () => void;
  onSaveGrade: () => void;
  isGenerating: boolean;
  saving: boolean;
}

const DiscussionGradingSection: React.FC<DiscussionGradingSectionProps> = ({
  discussion,
  gradeInput,
  setGradeInput,
  feedbackInput,
  setFeedbackInput,
  currentGrade,
  currentSubmission,
  isSummativeAssessment,
  setIsSummativeAssessment,
  useRubricForAI,
  setUseRubricForAI,
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  onAIGrading,
  onSaveGrade,
  isGenerating,
  saving
}) => {
  // Calculate the correct points possible value
  const getMaxPoints = () => {
    // First check if discussion has points_possible directly
    if (discussion.points_possible && discussion.points_possible > 0) {
      console.log('Using discussion.points_possible:', discussion.points_possible);
      return discussion.points_possible;
    }
    
    // Then check if the linked assignment has points_possible
    if (discussion.assignment?.points_possible && discussion.assignment.points_possible > 0) {
      console.log('Using discussion.assignment.points_possible:', discussion.assignment.points_possible);
      return discussion.assignment.points_possible;
    }
    
    // Fallback to 100 if no points found
    console.log('No valid points_possible found, using fallback of 100');
    return 100;
  };

  const maxPoints = getMaxPoints();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade & Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <GradeInput
              gradeInput={gradeInput}
              setGradeInput={setGradeInput}
              maxPoints={maxPoints}
              currentScore={currentGrade?.score}
            />
            
            <FeedbackInput
              commentInput={feedbackInput}
              setCommentInput={setFeedbackInput}
            />
          </div>

          <div className="space-y-4">
            <AIGradingSection
              isSummativeAssessment={isSummativeAssessment}
              setIsSummativeAssessment={setIsSummativeAssessment}
              useRubricForAI={useRubricForAI}
              setUseRubricForAI={setUseRubricForAI}
              useCustomPrompt={useCustomPrompt}
              setUseCustomPrompt={setUseCustomPrompt}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              assignment={discussion.assignment || null}
            />

            <ActionButtons
              onAIGrading={onAIGrading}
              onSaveGrade={onSaveGrade}
              isGenerating={isGenerating}
              isProcessingFiles={false}
              saving={saving}
              gradeInput={gradeInput}
              currentSubmission={currentSubmission}
              assignment={discussion.assignment || null}
              useRubricForAI={useRubricForAI}
              isSummativeAssessment={isSummativeAssessment}
              useCustomPrompt={useCustomPrompt}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionGradingSection;
