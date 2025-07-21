
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import EnhancedDiscussionHeader from '@/components/grading/EnhancedDiscussionHeader';
import GradeDiscussionContent from '@/components/grading/GradeDiscussionContent';
import ErrorDisplay from '@/components/grading/ErrorDisplay';
import LoadingDisplay from '@/components/grading/LoadingDisplay';
import { useGradeDiscussion } from '@/hooks/useGradeDiscussion';
import { useAuth } from '@/contexts/AuthContext';

const GradeDiscussion = () => {
  const { courseId, discussionId } = useParams<{ courseId: string; discussionId: string }>();
  const { session } = useAuth();
  
  console.log('GradeDiscussion page loaded with params:', { courseId, discussionId });
  
  const {
    discussion,
    entries,
    grades,
    loading,
    error,
    saveGrade,
    retryFetch,
    setEntries,
    setGrades
  } = useGradeDiscussion(courseId, discussionId);

  if (!session) {
    console.log('No session found, showing loading...');
    return <LoadingDisplay />;
  }

  if (loading) {
    console.log('Loading discussion data...');
    return <LoadingDisplay />;
  }

  if (error) {
    console.error('Error loading discussion:', error);
  }

  if (!discussion && !loading) {
    console.warn('No discussion data found and not loading');
  }

  // Create voice context for discussion grading
  const voiceContext = {
    discussion,
    entries,
    grades,
    saveGrade,
    setEntries,
    setGrades,
    // Add navigation functions that will be available in the grading form
    participants: entries.reduce((acc, entry) => {
      const userId = entry.user_id;
      if (!acc.find(p => p.id === userId)) {
        acc.push({
          id: userId,
          name: entry.user.name || entry.user.display_name || `User ${userId}`
        });
      }
      return acc;
    }, [] as Array<{ id: number; name: string }>)
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-16">
          <EnhancedDiscussionHeader 
            courseId={courseId!} 
            discussion={discussion}
            entries={entries}
            grades={grades}
            voiceContext={voiceContext}
          />

          {error && (
            <div className="max-w-7xl mx-auto px-6 py-6">
              <ErrorDisplay error={error} onRetry={retryFetch} />
            </div>
          )}

          <GradeDiscussionContent
            discussion={discussion}
            entries={entries}
            grades={grades}
            saveGrade={saveGrade}
            setEntries={setEntries}
            setGrades={setGrades}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeDiscussion;
