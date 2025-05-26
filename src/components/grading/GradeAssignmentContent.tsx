
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AssignmentDetailsCard from './AssignmentDetailsCard';
import SubmissionsList from './SubmissionsList';
import StudentSubmissionView from './StudentSubmissionView';
import GradingForm from './GradingForm';
import { useGradingForm } from '@/hooks/useGradingForm';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  html_url: string;
  submission_types: string[];
}

interface Submission {
  id: number;
  user_id: number;
  assignment_id: number;
  submitted_at: string | null;
  graded_at: string | null;
  grade: string | null;
  score: number | null;
  submission_comments: any[] | null;
  body: string | null;
  url: string | null;
  attachments: any[];
  workflow_state: string;
  late: boolean;
  missing: boolean;
  submission_type: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    sortable_name: string;
  };
}

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Assignment Details & Navigation */}
      <div className="lg:col-span-1 space-y-6">
        <AssignmentDetailsCard 
          assignment={assignment} 
          submissionsCount={submissions.length} 
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
                  ? "No student submissions found for this assignment. This could mean no students are enrolled or there's an issue fetching the data." 
                  : "Select a student from the list to view their submission."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GradeAssignmentContent;
