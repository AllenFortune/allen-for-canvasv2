
import React, { useState, useEffect, useMemo } from 'react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';
import DiscussionStudentNavigation from './DiscussionStudentNavigation';
import DiscussionPostsView from './DiscussionPostsView';
import DiscussionGradingSection from './DiscussionGradingSection';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { useStudentParticipation } from './StudentParticipationProcessor';
import { buildDiscussionContent, createMockSubmission } from './DiscussionContentBuilder';

interface DiscussionGradingFormProps {
  discussion: Discussion;
  user: DiscussionEntry['user'];
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
  saveGrade: (userId: number, grade: string, feedback: string) => Promise<boolean>;
  currentUserIndex: number;
  totalUsers: number;
  onUserChange: (index: number) => void;
}

const DiscussionGradingForm: React.FC<DiscussionGradingFormProps> = ({
  discussion,
  user,
  entries,
  grades,
  saveGrade,
  currentUserIndex,
  totalUsers,
  onUserChange
}) => {
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [saving, setSaving] = useState(false);

  // AI Grading state
  const [isSummativeAssessment, setIsSummativeAssessment] = useState(true);
  const [useRubricForAI, setUseRubricForAI] = useState(false);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const { generateComprehensiveFeedback, isGenerating } = useAIFeedback();

  const currentGrade = grades.find(g => g.user_id === user.id);

  console.log('DiscussionGradingForm - Current user:', user);
  console.log('DiscussionGradingForm - All entries count:', entries.length);
  console.log('DiscussionGradingForm - Entries sample:', entries.slice(0, 3));

  // Process student participation data
  const studentParticipation = useStudentParticipation({ entries, userId: user.id });

  // Create mock submission for the current user
  const mockSubmission = useMemo(() => {
    const combinedContent = buildDiscussionContent({ user, studentParticipation });
    return createMockSubmission(
      user,
      discussion.id,
      discussion.assignment_id || discussion.id,
      studentParticipation,
      currentGrade,
      combinedContent
    );
  }, [user, studentParticipation, discussion.id, discussion.assignment_id, currentGrade]);

  useEffect(() => {
    if (currentGrade) {
      setGradeInput(currentGrade.grade || '');
      setFeedbackInput(currentGrade.feedback || '');
    } else {
      setGradeInput('');
      setFeedbackInput('');
    }
  }, [currentGrade, user.id]);

  const handleSaveGrade = async () => {
    setSaving(true);
    const success = await saveGrade(user.id, gradeInput, feedbackInput);
    setSaving(false);
  };

  const handleAIGrading = async () => {
    const mockAssignment = {
      id: discussion.assignment_id || discussion.id,
      name: discussion.title,
      description: discussion.message,
      due_at: null,
      points_possible: discussion.points_possible,
      course_id: discussion.course_id,
      html_url: discussion.html_url,
      submission_types: ['discussion_topic'],
      rubric: discussion.assignment?.rubric || null
    };

    const result = await generateComprehensiveFeedback(
      mockSubmission as any,
      mockAssignment,
      currentGrade?.grade || undefined,
      useRubricForAI,
      isSummativeAssessment,
      useCustomPrompt ? customPrompt : undefined
    );

    if (result) {
      if (result.grade !== null) {
        setGradeInput(result.grade.toString());
      }
      setFeedbackInput(result.feedback);
    }
  };

  return (
    <div className="space-y-6">
      <DiscussionStudentNavigation
        user={user}
        entriesCount={studentParticipation.totalParticipation}
        currentUserIndex={currentUserIndex}
        totalUsers={totalUsers}
        onUserChange={onUserChange}
      />

      <DiscussionPostsView 
        entries={studentParticipation.allRelevantEntries}
        studentUserId={user.id}
        showContext={true}
      />

      <DiscussionGradingSection
        discussion={discussion}
        gradeInput={gradeInput}
        setGradeInput={setGradeInput}
        feedbackInput={feedbackInput}
        setFeedbackInput={setFeedbackInput}
        currentGrade={currentGrade}
        currentSubmission={mockSubmission}
        isSummativeAssessment={isSummativeAssessment}
        setIsSummativeAssessment={setIsSummativeAssessment}
        useRubricForAI={useRubricForAI}
        setUseRubricForAI={setUseRubricForAI}
        useCustomPrompt={useCustomPrompt}
        setUseCustomPrompt={setUseCustomPrompt}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
        onAIGrading={handleAIGrading}
        onSaveGrade={handleSaveGrade}
        isGenerating={isGenerating}
        saving={saving}
      />
    </div>
  );
};

export default DiscussionGradingForm;
