
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';
import GradeInput from './GradeInput';
import FeedbackInput from './FeedbackInput';
import AIGradingSection from './AIGradingSection';
import ActionButtons from './ActionButtons';
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
    // Create a mock submission object from discussion entries
    const combinedContent = entries.map(entry => entry.message).join('\n\n');
    
    const mockSubmission = {
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
      mockSubmission,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Student Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  {entries.length} discussion post{entries.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserChange(Math.max(0, currentUserIndex - 1))}
                disabled={currentUserIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-3">
                {currentUserIndex + 1} of {totalUsers}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserChange(Math.min(totalUsers - 1, currentUserIndex + 1))}
                disabled={currentUserIndex === totalUsers - 1}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Discussion Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Discussion Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <span className="font-medium">{entry.user.name}</span>
                <span>•</span>
                <span>{formatDate(entry.created_at)}</span>
              </div>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.message }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Grading Form */}
      <Card>
        <CardHeader>
          <CardTitle>Grade & Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <GradeInput
                value={gradeInput}
                onChange={setGradeInput}
                maxPoints={discussion.points_possible || undefined}
                placeholder="Enter grade..."
              />
              
              <FeedbackInput
                value={feedbackInput}
                onChange={setFeedbackInput}
                placeholder="Enter your feedback for the student's discussion participation..."
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
                onAIGrading={handleAIGrading}
                onSaveGrade={handleSaveGrade}
                isGenerating={isGenerating}
                isProcessingFiles={false}
                saving={saving}
                gradeInput={gradeInput}
                assignment={discussion.assignment || null}
                useRubricForAI={useRubricForAI}
                isSummativeAssessment={isSummativeAssessment}
                useCustomPrompt={useCustomPrompt}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscussionGradingForm;
