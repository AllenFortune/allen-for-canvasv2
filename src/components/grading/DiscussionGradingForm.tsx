
import React, { useState, useEffect } from 'react';
import { Discussion, DiscussionEntry, DiscussionGrade, DiscussionSubmission } from '@/types/grading';
import DiscussionStudentNavigation from './DiscussionStudentNavigation';
import DiscussionPostsView from './DiscussionPostsView';
import DiscussionGradingSection from './DiscussionGradingSection';
import { useAIFeedback } from '@/hooks/useAIFeedback';

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
    // Create a discussion submission object with proper user data handling
    const combinedContent = entries.map(entry => entry.message).join('\n\n');
    
    const mockSubmission: DiscussionSubmission = {
      id: user.id,
      user_id: user.id,
      assignment_id: discussion.assignment_id || 0,
      submitted_at: entries[0]?.created_at || null,
      graded_at: null,
      grade: currentGrade?.grade || null,
      score: currentGrade?.score || null,
      submission_comments: null,
      body: combinedContent,
      url: null,
      attachments: [],
      workflow_state: 'submitted',
      late: false,
      missing: false,
      submission_type: 'discussion_topic',
      user: user
    };

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
      mockSubmission as any, // Type assertion for compatibility with the hook
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
        entriesCount={entries.length}
        currentUserIndex={currentUserIndex}
        totalUsers={totalUsers}
        onUserChange={onUserChange}
      />

      <DiscussionPostsView entries={entries} />

      <DiscussionGradingSection
        discussion={discussion}
        gradeInput={gradeInput}
        setGradeInput={setGradeInput}
        feedbackInput={feedbackInput}
        setFeedbackInput={setFeedbackInput}
        currentGrade={currentGrade}
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
