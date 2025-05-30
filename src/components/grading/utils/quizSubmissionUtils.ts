
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
    default:
      return type.replace(/_/g, ' ');
  }
};

export const isContentEffectivelyEmpty = (content: string | string[] | null | undefined): boolean => {
  if (content === null || content === undefined) return true;

  if (Array.isArray(content)) {
    // If it's an array, check if all items are effectively empty
    return content.every(item => isContentEffectivelyEmpty(item));
  }

  if (typeof content === 'string') {
    // Strip HTML tags and trim whitespace
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    return strippedContent.length === 0;
  }

  return false; // For other types, consider it not empty
};
