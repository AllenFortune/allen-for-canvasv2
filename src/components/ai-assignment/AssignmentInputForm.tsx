import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StepWizard from './StepWizard';
import MethodSelectionStep from './steps/MethodSelectionStep';
import ContentInputStep from './steps/ContentInputStep';
import MetadataStep from './steps/MetadataStep';

interface AssignmentInputFormProps {
  onIntegrationGenerated: (integration: any, assignmentData: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AssignmentInputForm: React.FC<AssignmentInputFormProps> = ({
  onIntegrationGenerated,
  loading,
  setLoading
}) => {
  // Form state
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [gradeLevel, setGradeLevel] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [canvasIds, setCanvasIds] = useState<{courseId?: string; assignmentId?: string}>({});
  
  // New contextual state
  const [classFormat, setClassFormat] = useState('');
  const [assignmentType, setAssignmentType] = useState('');
  const [completionLocation, setCompletionLocation] = useState('');
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState('method');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<'manual' | 'canvas'>('manual');

  const steps = [
    { id: 'method', title: 'Choose Method', description: 'How to input assignment' },
    { id: 'content', title: 'Assignment Details', description: 'Title and content' },
    { id: 'metadata', title: 'Assignment Context', description: 'Subject and contextual details' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setAssignmentText(`[File uploaded: ${uploadedFile.name}]`);
    }
  };

  const handleCanvasAssignmentImported = (importedAssignment: {
    title: string;
    content: string;
    subject?: string;
    gradeLevel?: string;
    estimatedTime?: string;
    courseId?: string;
    assignmentId?: string;
  }) => {
    setAssignmentTitle(importedAssignment.title);
    setAssignmentText(importedAssignment.content);
    if (importedAssignment.subject) {
      const predefinedSubjects = ['english', 'math', 'science', 'social-studies', 'history', 'art'];
      if (predefinedSubjects.includes(importedAssignment.subject.toLowerCase())) {
        setSubject(importedAssignment.subject.toLowerCase());
        setIsCustomSubject(false);
        setCustomSubject('');
      } else {
        setSubject('custom');
        setIsCustomSubject(true);
        setCustomSubject(importedAssignment.subject);
      }
    }
    setEstimatedTime(importedAssignment.estimatedTime || '');
    setCanvasIds({
      courseId: importedAssignment.courseId,
      assignmentId: importedAssignment.assignmentId
    });
    
    // Auto-advance to content step
    setCurrentStep('content');
    setCompletedSteps(['method']);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    if (value === 'custom') {
      setIsCustomSubject(true);
    } else {
      setIsCustomSubject(false);
      setCustomSubject('');
    }
  };

  const getSubjectValue = () => {
    return isCustomSubject ? customSubject : subject;
  };

  const handleNext = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1].id;
      setCurrentStep(nextStep);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handlePrevious = () => {
    const stepIndex = steps.findIndex(step => step.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const canProceedFromMethod = inputMethod === 'manual' || (inputMethod === 'canvas' && !!assignmentTitle && !!assignmentText);
  const canProceedFromContent = !!assignmentTitle.trim() && !!assignmentText.trim();

  const handleSubmit = async () => {
    if (!assignmentText.trim() || !assignmentTitle.trim()) {
      alert('Please provide both assignment title and content.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-assignment-integration', {
        body: {
          assignmentTitle,
          assignmentText,
          subject: getSubjectValue(),
          gradeLevel,
          estimatedTime,
          classFormat,
          assignmentType,
          completionLocation
        }
      });
      if (error) throw error;
      const assignmentData = {
        title: assignmentTitle,
        content: assignmentText,
        subject: getSubjectValue(),
        gradeLevel,
        estimatedTime,
        classFormat,
        assignmentType,
        completionLocation,
        courseId: canvasIds.courseId,
        assignmentId: canvasIds.assignmentId
      };
      onIntegrationGenerated(data, assignmentData);
    } catch (error) {
      console.error('Error generating integration:', error);
      alert('Failed to generate AI integration suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method':
        return (
          <MethodSelectionStep
            inputMethod={inputMethod}
            setInputMethod={setInputMethod}
            onCanvasAssignmentImported={handleCanvasAssignmentImported}
            onNext={handleNext}
            canProceed={canProceedFromMethod}
            loading={loading}
          />
        );

      case 'content':
        return (
          <ContentInputStep
            assignmentTitle={assignmentTitle}
            setAssignmentTitle={setAssignmentTitle}
            assignmentText={assignmentText}
            setAssignmentText={setAssignmentText}
            inputMethod={inputMethod}
            file={file}
            onFileUpload={(event: React.ChangeEvent<HTMLInputElement>) => {
              const uploadedFile = event.target.files?.[0];
              if (uploadedFile) {
                setFile(uploadedFile);
                setAssignmentText(`[File uploaded: ${uploadedFile.name}]`);
              }
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canProceed={canProceedFromContent}
          />
        );

      case 'metadata':
        return (
          <MetadataStep
            subject={subject}
            onSubjectChange={handleSubjectChange}
            customSubject={customSubject}
            setCustomSubject={setCustomSubject}
            isCustomSubject={isCustomSubject}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            estimatedTime={estimatedTime}
            setEstimatedTime={setEstimatedTime}
            classFormat={classFormat}
            setClassFormat={setClassFormat}
            assignmentType={assignmentType}
            setAssignmentType={setAssignmentType}
            completionLocation={completionLocation}
            setCompletionLocation={setCompletionLocation}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <StepWizard
      steps={steps}
      currentStep={currentStep}
      completedSteps={completedSteps}
    >
      {renderStepContent()}
    </StepWizard>
  );
};

export default AssignmentInputForm;
