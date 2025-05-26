
import React from 'react';

interface ParticipationSummaryProps {
  initialPostsCount: number;
  repliesCount: number;
}

const ParticipationSummary: React.FC<ParticipationSummaryProps> = ({
  initialPostsCount,
  repliesCount
}) => {
  const totalPosts = initialPostsCount + repliesCount;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Participation Summary</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{initialPostsCount}</div>
          <div className="text-gray-600">Initial Posts</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{repliesCount}</div>
          <div className="text-gray-600">Replies</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{totalPosts}</div>
          <div className="text-gray-600">Total Posts</div>
        </div>
      </div>
    </div>
  );
};

export default ParticipationSummary;
