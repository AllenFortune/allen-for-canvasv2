
export interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  html_url: string;
  submission_types: string[];
  rubric?: any; // Add rubric property as optional
}

export interface Submission {
  id: number | string;
  user_id: number;
  assignment_id: number;
  submitted_at: string | null;
  graded_at: string | null;
  grade: string | null;
  score: number | null;
  submission_comments: any[] | null;
  body: string | null;
  url: string | null;
  attachments: any[];
  workflow_state: string;
  late: boolean;
  missing: boolean;
  submission_type: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    sortable_name: string;
  };
}

export interface Discussion {
  id: number;
  title: string;
  message: string;
  posted_at: string | null;
  discussion_type: string;
  points_possible: number | null;
  course_id: number;
  html_url: string;
  assignment_id?: number;
  assignment?: Assignment;
}

export interface DiscussionEntry {
  id: number;
  user_id: number;
  discussion_id: number;
  created_at: string;
  updated_at: string;
  message: string;
  parent_id?: number | null;
  user_name?: string;
  user: {
    id: number;
    name?: string;
    display_name?: string;
    email?: string;
    avatar_url?: string | null;
    avatar_image_url?: string | null;
    sortable_name?: string;
    html_url?: string;
    pronouns?: string | null;
  };
  replies?: DiscussionEntry[];
  rating_sum?: number;
  rating_count?: number;
}

export interface DiscussionGrade {
  user_id: number;
  grade: string | null;
  score: number | null;
  feedback: string | null;
}
