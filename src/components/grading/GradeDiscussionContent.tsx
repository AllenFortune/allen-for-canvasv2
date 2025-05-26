
import React, { useState } from 'react';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';
import DiscussionEntriesList from './DiscussionEntriesList';
import DiscussionGradingForm from './DiscussionGradingForm';

interface GradeDiscussionContentProps {
  discussion: Discussion | null;
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
  saveGrade: (userId: number, grade: string, feedback: string) => Promise<boolean>;
  setEntries: React.Dispatch<React.SetStateAction<DiscussionEntry[]>>;
  setGrades: React.Dispatch<React.SetStateAction<DiscussionGrade[]>>;
}

const GradeDiscussionContent: React.FC<GradeDiscussionContentProps> = ({
  discussion,
  entries,
  grades,
  saveGrade,
  setEntries,
  setGrades
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  console.log('GradeDiscussionContent rendering with:', {
    discussionTitle: discussion?.title,
    entriesCount: entries.length,
    gradesCount: grades.length
  });

  // Group entries by user
  const userEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.user_id]) {
      acc[entry.user_id] = {
        user: entry.user,
        entries: []
      };
    }
    acc[entry.user_id].entries.push(entry);
    return acc;
  }, {} as Record<number, { user: DiscussionEntry['user']; entries: DiscussionEntry[] }>);

  const users = Object.values(userEntries);
  const currentUser = users[currentUserIndex];

  console.log('Processed user data:', {
    uniqueUsers: users.length,
    userIds: users.map(u => u.user.id),
    currentUserIndex,
    currentUser: currentUser ? { id: currentUser.user.id, name: currentUser.user.name } : null
  });

  if (!discussion || users.length === 0) {
    console.log('Showing empty state - discussion:', !!discussion, 'users:', users.length);
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">
            {!discussion ? 'Loading discussion...' : 'No discussion entries found.'}
          </p>
          {discussion && users.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              This discussion may not have any student posts yet, or there may be an issue loading the entries.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <DiscussionEntriesList
            userEntries={userEntries}
            grades={grades}
            discussion={discussion}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUserIndex={currentUserIndex}
            onUserChange={setCurrentUserIndex}
          />
        </div>
        
        <div className="lg:col-span-2">
          {currentUser && (
            <DiscussionGradingForm
              discussion={discussion}
              user={currentUser.user}
              entries={currentUser.entries}
              grades={grades}
              saveGrade={saveGrade}
              currentUserIndex={currentUserIndex}
              totalUsers={users.length}
              onUserChange={setCurrentUserIndex}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeDiscussionContent;
