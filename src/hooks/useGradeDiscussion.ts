
import { useEffect } from 'react';
import { useDiscussionDetails } from './useDiscussionDetails';
import { useDiscussionEntries } from './useDiscussionEntries';
import { useDiscussionGrading } from './useDiscussionGrading';
import { UseGradeDiscussionReturn } from '@/types/discussionGrading';

export const useGradeDiscussion = (courseId?: string, discussionId?: string): UseGradeDiscussionReturn => {
  console.log('useGradeDiscussion hook initialized with:', { courseId, discussionId });

  const {
    discussion,
    loading: discussionLoading,
    error: discussionError,
    fetchDiscussionDetails
  } = useDiscussionDetails(courseId, discussionId);

  const {
    entries,
    loading: entriesLoading,
    error: entriesError,
    fetchDiscussionEntries,
    setEntries
  } = useDiscussionEntries(courseId, discussionId);

  const {
    grades,
    saveGrade,
    setGrades,
    fetchExistingGrades
  } = useDiscussionGrading(courseId, discussionId);

  const loading = discussionLoading || entriesLoading;
  const error = discussionError || entriesError;

  const retryFetch = async () => {
    console.log('Retrying fetch operations...');
    await Promise.all([
      fetchDiscussionDetails(), 
      fetchDiscussionEntries(),
      fetchExistingGrades()
    ]);
  };

  useEffect(() => {
    if (courseId && discussionId) {
      console.log('Starting fetch operations...');
      Promise.all([
        fetchDiscussionDetails(), 
        fetchDiscussionEntries(),
        fetchExistingGrades()
      ]);
    } else {
      console.log('Missing courseId or discussionId in useEffect');
    }
  }, [courseId, discussionId]);

  return {
    discussion,
    entries,
    grades,
    loading,
    error,
    saveGrade,
    retryFetch,
    setEntries,
    setGrades
  };
};
