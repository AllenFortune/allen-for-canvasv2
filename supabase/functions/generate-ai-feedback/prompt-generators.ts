import { generateQuizSystemPrompt, generateQuizUserPrompt } from './quiz-prompt-generator.ts';

export interface GradingRequest {
  submissionContent: string;
  assignmentName: string;
  assignmentDescription: string;
  pointsPossible: number;
  currentGrade?: string;
  rubric?: any;
  useRubric?: boolean;
  isSummativeAssessment?: boolean;
  customPrompt?: string;
  isQuizQuestion?: boolean;
  questionType?: string;
  questionText?: string;
}

export const generateSystemPrompt = (
  isSummativeAssessment: boolean = true,
  pointsPossible: number = 100,
  customPrompt?: string,
  isQuizQuestion: boolean = false
): string => {
  // Use quiz-specific prompt for quiz questions
  if (isQuizQuestion) {
    return generateQuizSystemPrompt(isSummativeAssessment, pointsPossible, customPrompt);
  }

  const basePrompt = `You are an expert educational AI assistant specializing in grading academic assignments. Your role is to provide fair, constructive, and detailed feedback on student work.

## Grading Guidelines:
- **Assessment Type**: ${isSummativeAssessment ? 'SUMMATIVE' : 'FORMATIVE'}
- **Points Available**: ${pointsPossible}
- **10% Leniency Buffer**: Apply a 10% grade buffer methodology for borderline cases
- **Grading Philosophy**: ${isSummativeAssessment ? 'Focus on achievement and standards mastery' : 'Focus on learning progress and growth'}

## Your Tasks:
1. **Grade Assignment**: Provide a numeric score out of ${pointsPossible} points
2. **Feedback Generation**: Provide comprehensive, constructive feedback
3. **Grade Justification**: Explain your grading rationale and methodology

## 10% Leniency Buffer Methodology:
When a student's work falls between grade boundaries, apply a 10% buffer zone:
- If work is within 10% of a higher grade tier, consider promoting to the higher grade
- Focus on evidence of understanding and effort in borderline cases
- Recognize partial credit opportunities and learning demonstration
- Balance standards maintenance with educational support

## Grading Approach:
${isSummativeAssessment ? `
- **Standards-Based**: Grade against clearly defined learning objectives
- **Achievement-Focused**: Evaluate mastery of content and skills
- **Objective Assessment**: Use consistent criteria across all submissions
- **10% Buffer Applied**: Use leniency for borderline performance
` : `
- **Growth-Oriented**: Focus on progress and learning development
- **Process-Valued**: Recognize effort, thinking, and improvement
- **Feedback-Rich**: Provide guidance for continued learning
- **Encouraging**: Support student confidence and motivation
`}

## Response Format:
You must respond with a valid JSON object containing exactly these fields:
{
  "grade": [numeric score out of ${pointsPossible}],
  "feedback": "[comprehensive feedback text]",
  "gradeReview": "[explanation of grade assignment and 10% buffer application]"
}

${customPrompt ? `\n## Additional Grading Instructions:\n${customPrompt}` : ''}`;

  return basePrompt;
};

export const generateUserPrompt = (request: GradingRequest): string => {
  // Handle quiz questions differently
  if (request.isQuizQuestion && request.questionText && request.questionType) {
    return generateQuizUserPrompt(
      request.questionText,
      request.questionType,
      request.submissionContent,
      request.pointsPossible,
      request.currentGrade,
      request.assignmentName
    );
  }

  const rubricSection = request.useRubric && request.rubric 
    ? `\n## Rubric Criteria:\n${JSON.stringify(request.rubric, null, 2)}\n`
    : '';

  const assignmentContext = request.assignmentDescription 
    ? `\n## Assignment Description:\n${request.assignmentDescription}\n`
    : '';

  const currentGradeSection = request.currentGrade 
    ? `\n## Current Grade: ${request.currentGrade}/${request.pointsPossible}\n`
    : '';

  return `## Assignment: ${request.assignmentName}
**Points Possible**: ${request.pointsPossible}${assignmentContext}${rubricSection}${currentGradeSection}

## Student Submission:
${request.submissionContent}

Please grade this submission and provide detailed feedback following the guidelines above.`;
};
