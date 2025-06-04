
# Internal Development Log - Canvas Quiz Answer Extraction Project

## Project Overview
This project involves building a comprehensive Canvas LMS integration for extracting and displaying quiz submission answers, with particular focus on handling different question types (multiple choice, essay, matching, etc.).

## Key Changes Made

### Phase 1: Initial Quiz Answer Extraction Implementation
**Date**: Session 1
**Issue**: Need to extract quiz submission answers from Canvas API
**Solution**: 
- Implemented `get-canvas-quiz-submission-answers` edge function
- Created comprehensive question mapping system
- Added support for multiple Canvas API endpoints
**Status**: ✅ SUCCESSFUL - Basic extraction working

### Phase 2: Question Type-Specific Answer Handling
**Date**: Session 2
**Issue**: Different question types (matching, essay, multiple choice) had different data structures
**Solution**:
- Enhanced `extractAnswerByType` function with question type-specific logic
- Added handling for:
  - `matching_question`: Handle match pairs as arrays/objects
  - `essay_question`: Look for text content in multiple fields
  - `multiple_answers_question`: Handle array selections
  - `fill_in_multiple_blanks_question`: Handle multiple blank answers
- Updated `AnswerContentRenderer` component to display different answer formats
**Status**: ✅ SUCCESSFUL - Most question types working

### Phase 3: Essay Question Answer Extraction Enhancement
**Date**: Current session
**Issue**: Essay questions not populating despite other question types working
**Root Cause**: Canvas stores essay answers in different endpoints/formats than other question types
**Solutions Tried**:

#### ❌ UNSUCCESSFUL ATTEMPTS:
1. **Standard submission_data extraction**: Essay answers not found in regular submission data
2. **Questions API endpoint**: Returned question structure but no student answers
3. **Assignment submission fallback**: Only worked for assignment-based quizzes with body content

#### ✅ SUCCESSFUL SOLUTION:
**Enhanced Essay-Specific Extraction Strategy (STEP 6.5)**:
- Added submission events endpoint: `/api/v1/courses/{courseId}/quizzes/{quizId}/submissions/{submissionId}/events`
- Added specific attempt endpoint: `/api/v1/courses/{courseId}/quizzes/{quizId}/submissions/{submissionId}/attempts/{attemptNumber}`
- Added raw quiz submission endpoint: `/api/v1/quiz_submissions/{submissionId}`
- Implemented priority-based answer deduplication
- Enhanced logging for essay question debugging

**Implementation Details**:
- Check for essay questions specifically using `question.question_type === 'essay_question'`
- Look for answers in submission events where `event_type === 'question_answered'`
- Extract from `event.event_data.answer`, `event.event_data.text`, or `event.event_data.response`
- Only update existing answers if they don't already have content
- Track answer source for debugging purposes

**Status**: ✅ SUCCESSFUL - All question types now working

## Technical Architecture

### Key Components:
1. **Edge Function**: `supabase/functions/get-canvas-quiz-submission-answers/index.ts`
   - Main extraction logic
   - Multiple Canvas API endpoint integration
   - Question type-specific answer parsing
   - Comprehensive error handling and logging

2. **Frontend Component**: `src/components/grading/quiz-details/AnswerContentRenderer.tsx`
   - Displays different answer formats
   - Handles matching questions, essays, multiple choice, etc.
   - Type-safe rendering based on question type

### Data Flow:
1. Frontend requests quiz submission answers
2. Edge function fetches quiz questions for mapping
3. Multiple Canvas API endpoints attempted in priority order:
   - Quiz submission data (primary)
   - Questions API (secondary)
   - Assignment submission (fallback)
   - **Essay-specific endpoints** (events, attempts, raw data)
4. Answers mapped to questions using multiple strategies
5. Frontend renders answers with appropriate formatting

## Debugging Strategies That Work

### ✅ EFFECTIVE DEBUGGING APPROACHES:
1. **Comprehensive logging**: Log each step of the extraction process
2. **Question type identification**: Always log the question type being processed
3. **Multiple endpoint attempts**: Try different Canvas API endpoints
4. **Answer source tracking**: Track where each answer came from
5. **Data structure inspection**: Log the structure of returned data

### ❌ INEFFECTIVE APPROACHES:
1. **Single endpoint reliance**: Canvas stores data differently across question types
2. **Generic answer extraction**: Need question type-specific logic
3. **Assuming consistent data structures**: Canvas API varies significantly

## Known Issues and Solutions

### Issue: Essay Questions Not Populating
**Root Cause**: Canvas stores essay answers in specialized endpoints
**Solution**: Implement essay-specific extraction strategy with multiple endpoint fallbacks
**Prevention**: Always test with multiple question types, especially essay questions

### Issue: Matching Question Answer Format
**Root Cause**: Matching questions return complex data structures (arrays/objects)
**Solution**: Specific handling in `extractAnswerByType` to format match pairs properly
**Prevention**: Test with all question types during development

### Issue: Question ID Mapping Confusion
**Root Cause**: Canvas uses different ID schemes (question_id vs position-based)
**Solution**: Create comprehensive mapping using both strategies
**Prevention**: Always create multiple mapping strategies for Canvas data

## Best Practices Learned

1. **Always handle multiple Canvas API endpoints** - Canvas data is distributed across multiple endpoints
2. **Implement question type-specific logic** - Different question types have completely different data structures
3. **Use comprehensive logging** - Essential for debugging Canvas API inconsistencies
4. **Implement fallback strategies** - Primary endpoints may not contain all data
5. **Test with real Canvas data** - Canvas API behavior varies significantly from documentation

## File Change History

### `supabase/functions/get-canvas-quiz-submission-answers/index.ts`
- **Lines added**: ~200+ lines for essay-specific extraction
- **Key additions**: STEP 6.5 essay extraction logic, submission events handling, attempt-specific data processing
- **Current length**: 774 lines (⚠️ **NEEDS REFACTORING**)

### `src/components/grading/quiz-details/AnswerContentRenderer.tsx`
- **Changes**: Enhanced answer type rendering for matching questions and essays
- **Status**: Stable, focused component

## Future Maintenance Notes

1. **File Size Warning**: The main edge function is getting very large (774+ lines). Consider refactoring into smaller, focused functions.
2. **Canvas API Changes**: Monitor Canvas API for changes that might affect answer extraction
3. **Performance**: Consider caching strategies for question mapping data
4. **Error Handling**: Continue to enhance error handling for edge cases

## Success Metrics
- ✅ All question types now extract and display properly
- ✅ Essay questions working with enhanced extraction strategy
- ✅ Matching questions display formatted correctly
- ✅ Multiple choice and other standard question types stable
- ✅ Comprehensive logging for debugging
- ✅ Fallback strategies prevent data loss

---
*Last Updated*: Current session
*Next Review*: After any new issues or significant changes
