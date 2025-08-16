import React from 'react';
import { RubricBuilderState } from '@/types/rubric';
import { useRubricGeneration } from '@/hooks/useRubricGeneration';
import { useRubricExport } from '@/hooks/useRubricExport';
import { useRubricLibrary } from '@/hooks/useRubricLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import RubricGenerator from '../components/RubricGenerator';
import RubricPreview from '../components/RubricPreview';
import RubricActions from '../components/RubricActions';

interface RubricPreviewStepProps {
  state: RubricBuilderState;
  updateState: (updates: Partial<RubricBuilderState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  resolveSubjectArea: () => string;
}

const RubricPreviewStepRefactored: React.FC<RubricPreviewStepProps> = ({
  state,
  updateState,
  onNext,
  onPrevious,
  resolveSubjectArea
}) => {
  const { user } = useAuth();
  const { isGenerating, generateRubric, regenerateRubric } = useRubricGeneration();
  const { isExporting, exportToCanvas } = useRubricExport();
  const { isSaving, saveRubric } = useRubricLibrary();

  const handleGenerate = async () => {
    const rubric = await generateRubric({
      assignmentContent: state.assignmentContent,
      rubricType: state.rubricType,
      pointsPossible: state.pointsPossible,
      subjectArea: resolveSubjectArea(),
      gradeLevel: state.gradeLevel,
      includeDiverAlignment: state.includeDiverAlignment
    });

    if (rubric) {
      updateState({ generatedRubric: rubric });
    }
  };

  const handleRegenerate = async () => {
    const rubric = await regenerateRubric({
      assignmentContent: state.assignmentContent,
      rubricType: state.rubricType,
      pointsPossible: state.pointsPossible,
      subjectArea: resolveSubjectArea(),
      gradeLevel: state.gradeLevel,
      includeDiverAlignment: state.includeDiverAlignment
    });

    if (rubric) {
      updateState({ generatedRubric: rubric });
    }
  };

  const handleSave = async () => {
    if (!state.generatedRubric || !user) return;

    const rubricToSave = {
      ...state.generatedRubric,
      title: state.rubricTitle,
      description: resolveSubjectArea(),
      rubricType: state.rubricType,
      pointsPossible: state.pointsPossible,
      sourceContent: state.assignmentContent,
      sourceType: state.selectedAssignment ? 'canvas_assignment' as const : 'manual_input' as const,
      sourceAssignmentId: state.selectedAssignment?.id,
      courseId: state.selectedAssignment?.course_id,
      status: 'published' as const
    };

    const savedId = await saveRubric(rubricToSave);
    if (savedId) {
      updateState({
        generatedRubric: {
          ...state.generatedRubric,
          id: savedId
        }
      });
      onNext();
    }
  };

  const handleExport = async () => {
    if (!state.generatedRubric || !state.selectedAssignment) return;

    let rubricId = state.generatedRubric.id;

    // Save rubric first if not already saved
    if (!rubricId) {
      const rubricToSave = {
        ...state.generatedRubric,
        title: state.rubricTitle,
        description: resolveSubjectArea(),
        rubricType: state.rubricType,
        pointsPossible: state.pointsPossible,
        sourceContent: state.assignmentContent,
        sourceType: 'canvas_assignment' as const,
        sourceAssignmentId: state.selectedAssignment.id,
        courseId: state.selectedAssignment.course_id,
        status: 'published' as const
      };

      rubricId = await saveRubric(rubricToSave);
      if (!rubricId) return;

      updateState({
        generatedRubric: {
          ...state.generatedRubric,
          id: rubricId
        }
      });
    }

    const success = await exportToCanvas({
      rubricId,
      courseId: state.selectedAssignment.course_id,
      assignmentId: state.selectedAssignment.id,
      associationType: 'assignment'
    });

    if (success) {
      updateState({
        generatedRubric: {
          ...state.generatedRubric,
          exportedToCanvas: true
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rubric Preview & Generation</h3>
        <p className="text-muted-foreground">
          Generate your AI-powered rubric and preview the results
        </p>
      </div>

      {!state.generatedRubric ? (
        <RubricGenerator
          state={state}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      ) : (
        <div className="space-y-4">
          <RubricPreview
            rubric={state.generatedRubric}
            title={state.rubricTitle}
            onTitleChange={(title) => updateState({ rubricTitle: title })}
          />

          <RubricActions
            isSaving={isSaving}
            isExporting={isExporting}
            isGenerating={isGenerating}
            canExportToCanvas={!!state.selectedAssignment}
            onSave={handleSave}
            onExport={state.selectedAssignment ? handleExport : undefined}
            onRegenerate={handleRegenerate}
            showRegenerate={true}
          />
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        {state.generatedRubric && (
          <Button onClick={onNext}>
            Continue to Library
          </Button>
        )}
      </div>
    </div>
  );
};

export default RubricPreviewStepRefactored;