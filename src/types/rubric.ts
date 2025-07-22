
export interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  name: string;
  description: string;
  points: number;
}

export interface RubricData {
  id?: string;
  title: string;
  description: string;
  rubricType: 'analytic' | 'holistic' | 'single_point';
  status: 'draft' | 'published' | 'archived';
  pointsPossible: number;
  criteria: RubricCriterion[];
  performanceLevels: string[];
  sourceType?: 'canvas_assignment' | 'manual_input' | 'file_upload';
  sourceAssignmentId?: number;
  courseId?: number;
  sourceContent?: string;
  diverAlignment?: {
    components?: string[];
    integrated?: boolean;
  };
  aiLiteracyComponents?: string[];
  canvasRubricId?: number;
  exportedToCanvas?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastUsedAt?: string;
  usageCount?: number;
}

export interface RubricBuilderState {
  inputMethod: 'canvas' | 'manual' | 'file';
  assignmentContent: string;
  selectedAssignment: any | null;
  rubricType: 'analytic' | 'holistic' | 'single_point';
  pointsPossible: number;
  includeDiverAlignment: boolean;
  subjectArea: string;
  gradeLevel: string;
  customSubject: string;
  isCustomSubject: boolean;
  generatedRubric: RubricData | null;
  isGenerating: boolean;
  error: string | null;
  rubricTitle: string;
  // Alternative property names for compatibility
  sourceContent?: string;
  sourceTitle?: string;
  sourceType?: string;
  pointsScale?: number;
  context?: string;
  includeAILiteracy?: boolean;
  assignmentId?: string;
}

export interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  rubricType: 'analytic' | 'holistic' | 'single_point';
  subjectArea?: string;
  gradeLevel?: string;
  criteria: RubricCriterion[];
  performanceLevels: string[];
  diverAlignment?: object;
  isPublic: boolean;
  createdBy?: string;
}
