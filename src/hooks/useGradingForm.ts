import { useState, useEffect } from 'react';
import { Submission } from '@/types/grading';

export const useGradingForm = (submissions: Submission[], currentSubmissionIndex: number) => {
  const [gradeInput, setGradeInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [saving, setSaving] = useState(false);

  const getLatestComment = (comments: any[] | null) => {
    if (!comments || comments.length === 0) return '';
    return comments[comments.length - 1]?.comment || '';
  };

  const currentSubmission = submissions[currentSubmissionIndex];

  // Update form when submission changes
  useEffect(() => {
    if (currentSubmission) {
      setGradeInput(currentSubmission.score?.toString() || '');
      setCommentInput(getLatestComment(currentSubmission.submission_comments) || '');
    }
  }, [currentSubmission]);

  // Initialize form on first submission load
  useEffect(() => {
    if (submissions.length > 0) {
      const firstSubmission = submissions[0];
      setGradeInput(firstSubmission.score?.toString() || '');
      setCommentInput(getLatestComment(firstSubmission.submission_comments) || '');
    }
  }, [submissions]);

  const handleSaveGrade = async (saveGradeFn: (id: number, grade: string, comment: string) => Promise<boolean>, updateSubmissions: (updatedSubmissions: Submission[]) => void) => {
    if (!currentSubmission) return;

    setSaving(true);
    try {
      // Handle both string and number IDs - only proceed if it's a valid number
      const submissionId = typeof currentSubmission.id === 'string' 
        ? (currentSubmission.id.startsWith('placeholder_') ? null : parseInt(currentSubmission.id))
        : currentSubmission.id;

      if (!submissionId) {
        console.warn('Cannot save grade for placeholder submission');
        return;
      }

      const success = await saveGradeFn(submissionId, gradeInput, commentInput);
      
      if (success) {
        // Update local state
        const updatedSubmissions = [...submissions];
        updatedSubmissions[currentSubmissionIndex] = {
          ...currentSubmission,
          score: parseFloat(gradeInput) || null,
          workflow_state: 'graded'
        };
        updateSubmissions(updatedSubmissions);
      }
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setSaving(false);
    }
  };

  return {
    gradeInput,
    setGradeInput,
    commentInput,
    setCommentInput,
    saving,
    handleSaveGrade
  };
};
