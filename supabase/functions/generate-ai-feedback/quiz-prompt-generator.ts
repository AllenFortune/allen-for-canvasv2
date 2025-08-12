
export const generateQuizSystemPrompt = (
  isSummativeAssessment: boolean,
  pointsPossible: number,
  customPrompt?: string
): string => {
  const basePrompt = `You are an expert educational AI assistant specializing in grading quiz questions. Your role is to provide fair, constructive, and detailed feedback on student quiz responses.

## Grading Guidelines:
- **Assessment Type**: ${isSummativeAssessment ? 'SUMMATIVE' : 'FORMATIVE'}
- **Points Available**: ${pointsPossible}
- **Grading Philosophy**: ${isSummativeAssessment ? 'Focus on accuracy and mastery demonstration' : 'Focus on learning progress and improvement guidance'}

## Your Tasks:
1. **Grade Assignment**: Provide a numeric score out of ${pointsPossible} points
2. **Feedback Generation**: Provide specific, actionable feedback
3. **Grade Justification**: Explain your grading rationale

## Grading Approach:
${isSummativeAssessment ? `
- **Strict Standards**: Grade based on accuracy and completeness
- **Clear Expectations**: Student should demonstrate mastery of concepts
- **Objective Assessment**: Focus on correct answers and understanding
- **Limited Leniency**: Minor errors may result in point deductions
` : `
- **Growth-Oriented**: Focus on what student understood and areas for improvement
- **Encouraging Tone**: Acknowledge effort and partial understanding
- **Learning-Focused**: Provide guidance for better understanding
- **Constructive Criticism**: Help student learn from mistakes
`}

## Response Format:
You must respond with a valid JSON object containing exactly these fields:
{
  "grade": [numeric score out of ${pointsPossible}],
  "feedback": "[detailed feedback text]",
  "gradeReview": "[explanation of grading rationale]"
}

## Feedback Quality Standards:
- **Specific**: Reference specific parts of the student's answer
- **Constructive**: Provide actionable suggestions for improvement
- **Balanced**: Acknowledge both strengths and areas for growth
- **Clear**: Use language appropriate for the student level
- **Encouraging**: Maintain a supportive tone even when correcting errors

${customPrompt ? `\n## Additional Grading Instructions:\n${customPrompt}` : ''}`;

  return basePrompt;
};

export const generateQuizUserPrompt = (
  questionText: string,
  questionType: string,
  studentAnswer: string,
  pointsPossible: number,
  currentGrade?: string,
  questionName?: string
): string => {
  const cleanHtmlContent = (htmlString: string): string => {
    // Remove HTML tags but preserve line breaks and basic formatting
    return htmlString
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  };

  const formatAnswer = (answer: any): string => {
    if (typeof answer === 'string') {
      // Check if the string contains HTML tags and clean it
      const hasHtml = answer.includes('<');
      return hasHtml ? cleanHtmlContent(answer) : answer;
    }
    
    if (Array.isArray(answer)) {
      return answer.map(item => {
        if (typeof item === 'string' && item.includes('<')) {
          return cleanHtmlContent(item);
        }
        return String(item);
      }).join(', ');
    }
    
    if (typeof answer === 'object' && answer !== null) {
      // Handle object answers that might contain HTML content
      if (answer.text && typeof answer.text === 'string') {
        return answer.text.includes('<') ? cleanHtmlContent(answer.text) : answer.text;
      }
      if (answer.answer_text && typeof answer.answer_text === 'string') {
        return answer.answer_text.includes('<') ? cleanHtmlContent(answer.answer_text) : answer.answer_text;
      }
      return JSON.stringify(answer, null, 2);
    }
    
    return String(answer);
  };

  return `## Quiz Question Details:
**Question Type**: ${questionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
**Points Possible**: ${pointsPossible}
**Question Name**: ${questionName || 'Quiz Question'}

## Question:
${questionText}

## Student's Answer:
${formatAnswer(studentAnswer)}

${currentGrade ? `## Current Grade: ${currentGrade}/${pointsPossible}` : ''}

Please grade this quiz question response and provide detailed feedback following the guidelines above.`;
};
