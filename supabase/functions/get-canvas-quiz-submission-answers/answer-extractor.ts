
export const extractAnswerByType = (item: any, questionType: string) => {
  console.log(`Extracting answer for question type: ${questionType}`, {
    item_keys: Object.keys(item),
    answer: item.answer,
    text: item.text,
    answer_text: item.answer_text
  });

  switch (questionType) {
    case 'essay_question':
      // For essay questions, look for text content in multiple fields
      return item.text || item.answer_text || item.answer || item.response || null;
    
    case 'matching_question':
      // For matching questions, handle the match pairs
      if (item.answer && typeof item.answer === 'object') {
        if (Array.isArray(item.answer)) {
          // Handle array format for matching
          return item.answer.map((match: any, index: number) => ({
            match_id: match.answer_id || match.id || index,
            answer_text: match.text || match.answer_text || match.answer || 'No match'
          }));
        } else {
          // Handle object format for matching
          const matches = [];
          for (const [key, value] of Object.entries(item.answer)) {
            matches.push({
              match_id: key,
              answer_text: typeof value === 'string' ? value : JSON.stringify(value)
            });
          }
          return matches;
        }
      }
      return item.text || item.answer_text || null;
    
    case 'multiple_answers_question':
      // For multiple answer questions, handle array selections
      if (item.answer && Array.isArray(item.answer)) {
        return item.answer;
      }
      return item.answer || item.text || item.answer_text || null;
    
    case 'fill_in_multiple_blanks_question':
      // For fill-in-the-blank questions, handle multiple blank answers
      if (item.answer && typeof item.answer === 'object' && !Array.isArray(item.answer)) {
        const blanks = [];
        for (const [blankId, blankAnswer] of Object.entries(item.answer)) {
          blanks.push({
            blank_id: blankId,
            answer_text: blankAnswer
          });
        }
        return blanks;
      }
      return item.answer || item.text || item.answer_text || null;
    
    case 'multiple_choice_question':
    case 'true_false_question':
    default:
      // For standard question types, use the standard extraction
      return item.answer !== undefined ? item.answer : 
             item.text !== undefined ? item.text : 
             item.answer_text !== undefined ? item.answer_text : 
             item.response !== undefined ? item.response : null;
  }
};
