
export interface CanvasQuestion {
  id: number;
  question_name: string;
  question_text: string;
  question_type: string;
  position?: number;
}

export interface RawAnswer {
  submission_question_id: number | string;
  original_question_id: number | string;
  position_in_quiz: number;
  answer: any;
  question_name?: string;
  question_text?: string;
  question_type: string;
  points?: number;
  correct?: boolean | null;
  source: string;
}

export interface ProcessedAnswer {
  id: number;
  question_id: number;
  answer: any;
  question_name: string;
  question_text: string;
  question_type: string;
  points?: number;
  correct?: boolean | null;
  source: string;
  mapping_strategy: string;
}

export interface CanvasCredentials {
  canvas_instance_url: string;
  canvas_access_token: string;
}

export interface QuestionMaps {
  questionIdMap: Map<string, CanvasQuestion>;
  positionToQuestionMap: Map<number, CanvasQuestion>;
  allQuestions: CanvasQuestion[];
}
