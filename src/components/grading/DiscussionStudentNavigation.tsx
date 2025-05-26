
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, User, MessageCircle } from 'lucide-react';
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

  const getParticipationLevel = (count: number) => {
    if (count === 0) return { level: 'None', color: 'bg-red-100 text-red-800' };
    if (count === 1) return { level: 'Minimal', color: 'bg-yellow-100 text-yellow-800' };
    if (count <= 3) return { level: 'Good', color: 'bg-blue-100 text-blue-800' };
    return { level: 'Excellent', color: 'bg-green-100 text-green-800' };
  };

  const participation = getParticipationLevel(entriesCount);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{getUserName(user)}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{entriesCount} posts</span>
                </div>
                <Badge className={participation.color}>
                  {participation.level} Participation
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Student {currentUserIndex + 1} of {totalUsers}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserChange(Math.max(0, currentUserIndex - 1))}
                disabled={currentUserIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserChange(Math.min(totalUsers - 1, currentUserIndex + 1))}
                disabled={currentUserIndex === totalUsers - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionStudentNavigation;
