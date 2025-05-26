
import React, { useState, useEffect, useMemo } from 'react';
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

interface StudentParticipation {
  studentEntries: DiscussionEntry[];
  initialPosts: DiscussionEntry[];
  replies: DiscussionEntry[];
  repliedToPosts: DiscussionEntry[];
  allRelevantEntries: DiscussionEntry[];
  totalParticipation: number;
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

  // Process student participation data
  const studentParticipation: StudentParticipation = useMemo(() => {
    const studentEntries = entries.filter(entry => entry.user_id === user.id);
    const initialPosts = studentEntries.filter(entry => !entry.parent_id);
    const replies = studentEntries.filter(entry => entry.parent_id);
    
    // Get original posts that this student replied to for context
    const repliedToPosts = replies.map(reply => {
      return entries.find(entry => entry.id === reply.parent_id);
    }).filter(Boolean) as DiscussionEntry[];

    // Combine all relevant entries in chronological order
    const allRelevantEntries = [...initialPosts, ...replies, ...repliedToPosts]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return {
      studentEntries,
      initialPosts,
      replies,
      repliedToPosts,
      allRelevantEntries,
      totalParticipation: studentEntries.length
    };
  }, [entries, user.id]);

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
    // Create comprehensive content including initial posts, replies, and context
    let combinedContent = '';
    
    // Add participation summary
    combinedContent += `=== DISCUSSION PARTICIPATION SUMMARY ===\n`;
    combinedContent += `Student: ${user.name || 'Unknown Student'}\n`;
    combinedContent += `Total Posts: ${studentParticipation.totalParticipation}\n`;
    combinedContent += `Initial Posts: ${studentParticipation.initialPosts.length}\n`;
    combinedContent += `Replies: ${studentParticipation.replies.length}\n\n`;

    // Add initial posts
    if (studentParticipation.initialPosts.length > 0) {
      combinedContent += `=== INITIAL POSTS ===\n`;
      studentParticipation.initialPosts.forEach((post, index) => {
        combinedContent += `Initial Post ${index + 1} (Posted: ${new Date(post.created_at).toLocaleDateString()}):\n`;
        combinedContent += `${post.message}\n\n`;
      });
    }

    // Add replies with context
    if (studentParticipation.replies.length > 0) {
      combinedContent += `=== REPLIES TO CLASSMATES ===\n`;
      studentParticipation.replies.forEach((reply, index) => {
        const originalPost = studentParticipation.repliedToPosts.find(p => p?.id === reply.parent_id);
        combinedContent += `Reply ${index + 1} (Posted: ${new Date(reply.created_at).toLocaleDateString()}):\n`;
        
        if (originalPost) {
          combinedContent += `Replying to: ${originalPost.user?.name || 'Unknown'}\n`;
          combinedContent += `Original Post: ${originalPost.message.substring(0, 200)}${originalPost.message.length > 200 ? '...' : ''}\n`;
        }
        
        combinedContent += `Student's Reply: ${reply.message}\n\n`;
      });
    }

    // If no participation, note it
    if (studentParticipation.totalParticipation === 0) {
      combinedContent += `=== NO PARTICIPATION ===\n`;
      combinedContent += `This student has not participated in the discussion.\n`;
    }

    const mockSubmission: DiscussionSubmission = {
      id: user.id,
      user_id: user.id,
      assignment_id: discussion.assignment_id || 0,
      submitted_at: studentParticipation.studentEntries[0]?.created_at || null,
      graded_at: null,
      grade: currentGrade?.grade || null,
      score: currentGrade?.score || null,
      submission_comments: null,
      body: combinedContent,
      url: null,
      attachments: [],
      workflow_state: studentParticipation.totalParticipation > 0 ? 'submitted' : 'unsubmitted',
      late: false,
      missing: studentParticipation.totalParticipation === 0,
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
