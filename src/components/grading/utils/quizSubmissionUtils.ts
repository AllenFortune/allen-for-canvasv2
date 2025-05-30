
export const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not available';
  return new Date(dateString).toLocaleString();
};

export const getQuestionTypeDisplay = (type: string) => {
  switch (type) {
    case 'essay_question':
      return 'Essay';
    case 'fill_in_multiple_blanks_question':
      return 'Fill in the Blanks';
    case 'file_upload_question':
      return 'File Upload';
    case 'short_answer_question':
      return 'Short Answer';
    case 'multiple_choice_question':
      return 'Multiple Choice';
    case 'true_false_question':
      return 'True/False';
    case 'matching_question':
      return 'Matching';
    case 'multiple_answers_question':
      return 'Multiple Answers';
    default:
      return type.replace(/_/g, ' ');
  }
};

export const isContentEffectivelyEmpty = (content: string | string[] | null | undefined | object): boolean => {
  if (content === null || content === undefined) return true;

  if (Array.isArray(content)) {
    // If it's an array, check if all items are effectively empty
    return content.every(item => isContentEffectivelyEmpty(item));
  }

  if (typeof content === 'object') {
    // Handle object answers from Canvas
    const contentObj = content as any;
    
    // Check common Canvas answer object properties
    if (contentObj.text && typeof contentObj.text === 'string') {
      return isContentEffectivelyEmpty(contentObj.text);
    }
    
    if (contentObj.answer_text && typeof contentObj.answer_text === 'string') {
      return isContentEffectivelyEmpty(contentObj.answer_text);
    }
    
    if (contentObj.answers && Array.isArray(contentObj.answers)) {
      return contentObj.answers.every((answer: any) => 
        isContentEffectivelyEmpty(answer.text || answer.answer_text)
      );
    }
    
    // For other object types, check if it's an empty object
    return Object.keys(contentObj).length === 0;
  }

  if (typeof content === 'string') {
    // Strip HTML tags and trim whitespace
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    return strippedContent.length === 0;
  }

  return false; // For other types, consider it not empty
};
