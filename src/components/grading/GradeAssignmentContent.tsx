
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import HorizontalStudentNav from './HorizontalStudentNav';
import EnhancedSubmissionView from './EnhancedSubmissionView';
import EnhancedGradingForm from './EnhancedGradingForm';
import { useGradingForm } from '@/hooks/useGradingForm';
import { Assignment, Submission } from '@/types/grading';

interface GradeAssignmentContentProps {
  assignment: Assignment | null;
  submissions: Submission[];
  saveGrade: (submissionId: number, grade: string, comment: string) => Promise<boolean>;
  setSubmissions: (submissions: Submission[]) => void;
}

const GradeAssignmentContent: React.FC<GradeAssignmentContentProps> = ({
  assignment,
  submissions,
  saveGrade,
  setSubmissions
}) => {
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);

  const {
    gradeInput,
    setGradeInput,
    commentInput,
    setCommentInput,
    saving,
    handleSaveGrade
  } = useGradingForm(submissions, currentSubmissionIndex);

  const currentSubmission = submissions[currentSubmissionIndex];

  const handleSubmissionChange = (index: number) => {
    setCurrentSubmissionIndex(index);
  };

  const onSaveGrade = () => {
    handleSaveGrade(saveGrade, setSubmissions);
  };

  if (submissions.length === 0) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No Submissions Found</h3>
            <p className="text-gray-600">
              There are no student submissions for this assignment yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Horizontal Student Navigation */}
      <HorizontalStudentNav
        submissions={submissions}
        currentSubmissionIndex={currentSubmissionIndex}
        onSubmissionChange={handleSubmissionChange}
        assignment={assignment}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Content - Takes up 2/3 of the width */}
          <div className="lg:col-span-2">
            {currentSubmission ? (
              <EnhancedSubmissionView submission={currentSubmission} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">
                    Please select a student to view their submission.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Grading Form - Takes up 1/3 of the width */}
          <div className="lg:col-span-1">
            {currentSubmission && (
              <EnhancedGradingForm
                assignment={assignment}
                gradeInput={gradeInput}
                setGradeInput={setGradeInput}
                commentInput={commentInput}
                setCommentInput={setCommentInput}
                onSaveGrade={onSaveGrade}
                saving={saving}
                currentScore={currentSubmission.score}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeAssignmentContent;
