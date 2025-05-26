
import { useState, useEffect } from 'react';

interface Submission {
  id: number;
  score: number | null;
  submission_comments: any[] | null;
}

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
      const success = await saveGradeFn(currentSubmission.id, gradeInput, commentInput);
      
      if (success) {
        // Update local state
        const updatedSubmissions = [...submissions];
        updatedSubmissions[currentSubmissionIndex] = {
          ...currentSubmission,
          score: parseFloat(gradeInput) || null,
          workflow_state: 'graded' as any
        };
        updateSubmissions(updatedSubmissions);
      }
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
