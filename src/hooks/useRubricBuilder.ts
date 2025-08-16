import { useState, useCallback } from 'react';
import { RubricData, RubricBuilderState } from '@/types/rubric';
import { generateRubricTitle } from '@/utils/rubricUtils';

const initialState: RubricBuilderState = {
  inputMethod: 'canvas',
  assignmentContent: '',
  selectedAssignment: null,
  rubricType: 'analytic',
  pointsPossible: 100,
  includeDiverAlignment: false,
  subjectArea: '',
  gradeLevel: '',
  customSubject: '',
  isCustomSubject: false,
  generatedRubric: null,
  isGenerating: false,
  error: null,
  rubricTitle: 'Assignment Rubric'
};

export const useRubricBuilder = () => {
  const [state, setState] = useState<RubricBuilderState>(initialState);

  const updateState = useCallback((updates: Partial<RubricBuilderState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Auto-generate rubric title when assignment changes
      if (updates.selectedAssignment !== undefined || updates.inputMethod !== undefined) {
        newState.rubricTitle = generateRubricTitle(newState.selectedAssignment);
      }
      
      // Auto-populate points from Canvas assignment
      if (updates.selectedAssignment) {
        const pointsPossible = newState.selectedAssignment?.points_possible;
        if (pointsPossible && pointsPossible > 0) {
          newState.pointsPossible = pointsPossible;
        } else if (!newState.selectedAssignment) {
          newState.pointsPossible = 100;
        }
      }
      
      return newState;
    });
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const setGeneratedRubric = useCallback((rubric: RubricData | null) => {
    updateState({ generatedRubric: rubric });
  }, [updateState]);

  const setError = useCallback((error: string | null) => {
    updateState({ error });
  }, [updateState]);

  const setLoading = useCallback((isGenerating: boolean) => {
    updateState({ isGenerating });
  }, [updateState]);

  const updateRubricTitle = useCallback((title: string) => {
    updateState({ rubricTitle: title });
  }, [updateState]);

  const resolveSubjectArea = useCallback(() => {
    if (state.isCustomSubject && state.customSubject) {
      return state.customSubject;
    }
    return state.subjectArea || 'General';
  }, [state.isCustomSubject, state.customSubject, state.subjectArea]);

  return {
    state,
    updateState,
    resetState,
    setGeneratedRubric,
    setError,
    setLoading,
    updateRubricTitle,
    resolveSubjectArea
  };
};