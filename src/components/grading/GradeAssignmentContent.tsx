
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentDetailsCard from './AssignmentDetailsCard';
import GradingStatusCard from './GradingStatusCard';
import SubmissionsList from './SubmissionsList';
import StudentNavigationPanel from './StudentNavigationPanel';
import StudentSubmissionView from './StudentSubmissionView';
import GradingForm from './GradingForm';
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
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'navigate'>('navigate'); // Default to navigate mode

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

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('navigate')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'navigate' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Navigate Mode
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List Mode
          </button>
        </div>
      </div>

      {viewMode === 'navigate' ? (
        /* Navigate Mode Layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Assignment Details & Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <AssignmentDetailsCard 
              assignment={assignment} 
              submissionsCount={submissions.length} 
            />
            
            <GradingStatusCard 
              submissions={submissions}
              assignment={assignment}
            />
            
            <StudentNavigationPanel
              submissions={submissions}
              currentSubmissionIndex={currentSubmissionIndex}
              onSubmissionChange={handleSubmissionChange}
              assignment={assignment}
            />
          </div>

          {/* Main Content - Student Submission and Grading */}
          <div className="lg:col-span-3 space-y-6">
            {currentSubmission ? (
              <>
                <StudentSubmissionView submission={currentSubmission} />
                <GradingForm
                  assignment={assignment}
                  gradeInput={gradeInput}
                  setGradeInput={setGradeInput}
                  commentInput={commentInput}
                  setCommentInput={setCommentInput}
                  onSaveGrade={onSaveGrade}
                  saving={saving}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-600">
                    {submissions.length === 0 
                      ? "No student submissions found for this assignment." 
                      : "Select a student from the navigation panel to view their submission."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* List Mode Layout */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Assignment Details & Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <AssignmentDetailsCard 
              assignment={assignment} 
              submissionsCount={submissions.length} 
            />
            
            <GradingStatusCard 
              submissions={submissions}
              assignment={assignment}
            />
            
            <SubmissionsList
              submissions={submissions}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              currentSubmissionIndex={currentSubmissionIndex}
              onSubmissionChange={handleSubmissionChange}
              assignment={assignment}
            />
          </div>

          {/* Student Submission and Grading */}
          <div className="lg:col-span-3 space-y-6">
            {currentSubmission ? (
              <>
                <StudentSubmissionView submission={currentSubmission} />
                <GradingForm
                  assignment={assignment}
                  gradeInput={gradeInput}
                  setGradeInput={setGradeInput}
                  commentInput={commentInput}
                  setCommentInput={setCommentInput}
                  onSaveGrade={onSaveGrade}
                  saving={saving}
                />
              </>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-gray-600">
                    {submissions.length === 0 
                      ? "No student submissions found for this assignment." 
                      : "Select a student from the list to view their submission."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeAssignmentContent;
