
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';

interface DiscussionEntriesListProps {
  userEntries: Record<number, { user: DiscussionEntry['user']; entries: DiscussionEntry[] }>;
  grades: DiscussionGrade[];
  discussion: Discussion;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserIndex: number;
  onUserChange: (index: number) => void;
  sortedUsers: { user: DiscussionEntry['user']; entries: DiscussionEntry[] }[];
}

const DiscussionEntriesList: React.FC<DiscussionEntriesListProps> = ({
  userEntries,
  grades,
  discussion,
  activeTab,
  setActiveTab,
  currentUserIndex,
  onUserChange,
  sortedUsers
}) => {
  const getGradeStatusBadge = (userId: number) => {
    const grade = grades.find(g => g.user_id === userId);
    if (grade && grade.grade !== null) {
      return <Badge className="bg-green-500 text-white">Graded</Badge>;
    }
    return <Badge variant="outline" className="text-gray-500">Not Graded</Badge>;
  };

  const getScoreDisplay = (grade: DiscussionGrade) => {
    // Always use the points_possible from the Canvas discussion data
    const maxPoints = discussion.points_possible;
    
    console.log('DiscussionEntriesList - Discussion points_possible:', maxPoints);
    
    // If there's a score and max points are available
    if (grade && grade.score !== null && maxPoints !== null) {
      return `${grade.score}/${maxPoints}`;
    }
    
    // If there's a score but no max points available (should be rare)
    if (grade && grade.score !== null && maxPoints === null) {
      return `${grade.score}/Ungraded`;
    }
    
    // No score available
    return null;
  };

  const getUserInitials = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'U';
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getUserName = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'Unknown User';
    }
    return user.name;
  };

  const getUserLastName = (user: DiscussionEntry['user']) => {
    if (!user || !user.name) {
      return 'Unknown User';
    }
    
    // Split the name and get the last part as the last name
    const nameParts = user.name.trim().split(' ');
    if (nameParts.length > 1) {
      return nameParts[nameParts.length - 1];
    }
    
    // If there's only one name part, use it as both first and last
    return nameParts[0];
  };

  const filterUsers = () => {
    let filteredUsers;
    
    if (activeTab === 'all') {
      filteredUsers = sortedUsers;
    } else if (activeTab === 'graded') {
      filteredUsers = sortedUsers.filter(u => grades.find(g => g.user_id === u.user.id && g.grade !== null));
    } else if (activeTab === 'ungraded') {
      filteredUsers = sortedUsers.filter(u => !grades.find(g => g.user_id === u.user.id && g.grade !== null));
    } else {
      filteredUsers = sortedUsers;
    }

    return filteredUsers;
  };

  const filteredUsers = filterUsers();

  const gradedCount = sortedUsers.filter(u => grades.find(g => g.user_id === u.user.id && g.grade !== null)).length;
  const ungradedCount = sortedUsers.length - gradedCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Entries ({sortedUsers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All ({sortedUsers.length})</TabsTrigger>
            <TabsTrigger value="ungraded">
              Ungraded ({ungradedCount})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">No entries in this category.</p>
            </div>
          ) : (
            filteredUsers.map((userEntry, index) => {
              // Find the index in the sortedUsers array (which matches the main component's array)
              const sortedIndex = sortedUsers.findIndex(u => u.user.id === userEntry.user.id);
              const isSelected = sortedIndex === currentUserIndex;
              const grade = grades.find(g => g.user_id === userEntry.user.id);
              const scoreDisplay = getScoreDisplay(grade);
              
              return (
                <button
                  key={userEntry.user.id}
                  onClick={() => onUserChange(sortedIndex)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userEntry.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(userEntry.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getUserName(userEntry.user)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getGradeStatusBadge(userEntry.user.id)}
                        {scoreDisplay && (
                          <span className="text-xs text-gray-500">
                            {scoreDisplay}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {userEntry.entries.length} post{userEntry.entries.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionEntriesList;
