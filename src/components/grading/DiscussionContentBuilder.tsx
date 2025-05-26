
import { DiscussionEntry, DiscussionSubmission } from '@/types/grading';
import { StudentParticipation } from './StudentParticipationProcessor';

interface BuildDiscussionContentProps {
  user: DiscussionEntry['user'];
  studentParticipation: StudentParticipation;
}

export const buildDiscussionContent = ({ user, studentParticipation }: BuildDiscussionContentProps): string => {
  let combinedContent = '';
  
  // Add participation summary
  combinedContent += `=== DISCUSSION PARTICIPATION SUMMARY ===\n`;
  combinedContent += `Student: ${user.name || 'Unknown Student'}\n`;
  combinedContent += `Total Posts: ${studentParticipation.totalParticipation}\n`;
  combinedContent += `Initial Posts: ${studentParticipation.initialPosts.length}\n`;
  combinedContent += `Replies: ${studentParticipation.replies.length}\n\n`;

  // Add initial posts
  if (studentParticipation.initialPosts.length > 0) {
    combinedContent += `=== INITIAL POSTS ===\n`;
    studentParticipation.initialPosts.forEach((post, index) => {
      combinedContent += `Initial Post ${index + 1} (Posted: ${new Date(post.created_at).toLocaleDateString()}):\n`;
      combinedContent += `${post.message}\n\n`;
    });
  }

  // Add replies with context
  if (studentParticipation.replies.length > 0) {
    combinedContent += `=== REPLIES TO CLASSMATES ===\n`;
    studentParticipation.replies.forEach((reply, index) => {
      const originalPost = studentParticipation.repliedToPosts.find(p => p?.id === reply.parent_id);
      combinedContent += `Reply ${index + 1} (Posted: ${new Date(reply.created_at).toLocaleDateString()}):\n`;
      
      if (originalPost) {
        combinedContent += `Replying to: ${originalPost.user?.name || 'Unknown'}\n`;
        combinedContent += `Original Post: ${originalPost.message.substring(0, 200)}${originalPost.message.length > 200 ? '...' : ''}\n`;
      }
      
      combinedContent += `Student's Reply: ${reply.message}\n\n`;
    });
  }

  // If no participation, note it
  if (studentParticipation.totalParticipation === 0) {
    combinedContent += `=== NO PARTICIPATION ===\n`;
    combinedContent += `This student has not participated in the discussion.\n`;
  }

  return combinedContent;
};

export const createMockSubmission = (
  user: DiscussionEntry['user'],
  discussionId: number,
  assignmentId: number,
  studentParticipation: StudentParticipation,
  currentGrade: any,
  content: string
): DiscussionSubmission => {
  return {
    id: user.id,
    user_id: user.id,
    assignment_id: assignmentId,
    submitted_at: studentParticipation.studentEntries[0]?.created_at || null,
    graded_at: null,
    grade: currentGrade?.grade || null,
    score: currentGrade?.score || null,
    submission_comments: null,
    body: content,
    url: null,
    attachments: [],
    workflow_state: studentParticipation.totalParticipation > 0 ? 'submitted' : 'unsubmitted',
    late: false,
    missing: studentParticipation.totalParticipation === 0,
    submission_type: 'discussion_topic',
    user: user
  };
};
