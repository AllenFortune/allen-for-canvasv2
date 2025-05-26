
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DiscussionEntry } from '@/types/grading';

interface DiscussionStudentNavigationProps {
  user: DiscussionEntry['user'];
  entriesCount: number;
  currentUserIndex: number;
  totalUsers: number;
  onUserChange: (index: number) => void;
}

const DiscussionStudentNavigation: React.FC<DiscussionStudentNavigationProps> = ({
  user,
  entriesCount,
  currentUserIndex,
  totalUsers,
  onUserChange
}) => {
  return (
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
                {entriesCount} discussion post{entriesCount !== 1 ? 's' : ''}
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
  );
};

export default DiscussionStudentNavigation;
