
export interface Quiz {
  id: number;
  title: string;
  description: string;
  points_possible: number;
  time_limit: number;
  allowed_attempts: number;
  quiz_type: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_name: string;
  question_text: string;
  question_type: string;
  points_possible: number;
  position: number;
}

export interface QuizSubmission {
  id: number;
  user_id: number;
  quiz_id: number;
  attempt: number;
  score: number | null;
  kept_score: number | null;
  workflow_state: string;
  started_at: string | null;
  finished_at: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    sortable_name: string;
  };
}

export interface SubmissionAnswer {
  id: number;
  question_id: number;
  answer: string | string[] | null;
  correct: boolean | null;
  points: number | null;
}
