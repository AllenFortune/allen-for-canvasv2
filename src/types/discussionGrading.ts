
import { Discussion, DiscussionEntry, DiscussionGrade } from '@/types/grading';

export interface UseDiscussionDetailsReturn {
  discussion: Discussion | null;
  loading: boolean;
  error: string | null;
  fetchDiscussionDetails: () => Promise<void>;
}

export interface UseDiscussionEntriesReturn {
  entries: DiscussionEntry[];
  loading: boolean;
  error: string | null;
  fetchDiscussionEntries: () => Promise<void>;
  setEntries: React.Dispatch<React.SetStateAction<DiscussionEntry[]>>;
}

export interface UseDiscussionGradingReturn {
  grades: DiscussionGrade[];
  saveGrade: (userId: number, grade: string, feedback: string, aiGradeReview?: string) => Promise<boolean>;
  setGrades: React.Dispatch<React.SetStateAction<DiscussionGrade[]>>;
  fetchExistingGrades: () => Promise<void>;
}

export interface UseGradeDiscussionReturn {
  discussion: Discussion | null;
  entries: DiscussionEntry[];
  grades: DiscussionGrade[];
  loading: boolean;
  error: string | null;
  saveGrade: (userId: number, grade: string, feedback: string, aiGradeReview?: string) => Promise<boolean>;
  retryFetch: () => Promise<void>;
  setEntries: React.Dispatch<React.SetStateAction<DiscussionEntry[]>>;
  setGrades: React.Dispatch<React.SetStateAction<DiscussionGrade[]>>;
}
