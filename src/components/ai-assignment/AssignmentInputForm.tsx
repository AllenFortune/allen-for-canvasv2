import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Loader2, Upload, ArrowRight, ArrowLeft, Monitor, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CanvasAssignmentSelector from './CanvasAssignmentSelector';
import StepWizard from './StepWizard';

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
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState('method');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<'manual' | 'canvas'>('manual');

  const steps = [
    { id: 'method', title: 'Choose Method', description: 'How to input assignment' },
    { id: 'content', title: 'Assignment Details', description: 'Title and content' },
    { id: 'metadata', title: 'Optional Details', description: 'Subject and grade level' }
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

  const canProceedFromMethod = inputMethod === 'manual' || (inputMethod === 'canvas' && assignmentTitle && assignmentText);
  const canProceedFromContent = assignmentTitle.trim() && assignmentText.trim();

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
          estimatedTime
        }
      });
      if (error) throw error;
      const assignmentData = {
        title: assignmentTitle,
        content: assignmentText,
        subject: getSubjectValue(),
        gradeLevel,
        estimatedTime,
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
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">How would you like to input your assignment?</h3>
              <p className="text-muted-foreground text-sm">Choose the method that works best for you.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  inputMethod === 'manual' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setInputMethod('manual')}
              >
                <CardContent className="p-6 text-center">
                  <Edit className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Manual Input</h4>
                  <p className="text-sm text-muted-foreground">Type or paste your assignment content directly</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  inputMethod === 'canvas' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setInputMethod('canvas')}
              >
                <CardContent className="p-6 text-center">
                  <Monitor className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Import from Canvas</h4>
                  <p className="text-sm text-muted-foreground">Select an existing assignment from Canvas</p>
                </CardContent>
              </Card>
            </div>

            {inputMethod === 'canvas' && (
              <div className="mt-6">
                <CanvasAssignmentSelector 
                  onAssignmentImported={handleCanvasAssignmentImported}
                  loading={loading}
                />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleNext}
                disabled={!canProceedFromMethod}
              >
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Assignment Details</h3>
              <p className="text-muted-foreground text-sm">Provide the core information about your assignment.</p>
            </div>

            <div>
              <Label htmlFor="title">Assignment Title *</Label>
              <Input 
                id="title" 
                value={assignmentTitle} 
                onChange={e => setAssignmentTitle(e.target.value)} 
                placeholder="Enter assignment title" 
                required 
              />
            </div>

            <div>
              <Label htmlFor="content">Assignment Content *</Label>
              <Textarea 
                id="content" 
                value={assignmentText} 
                onChange={e => setAssignmentText(e.target.value)} 
                placeholder="Paste your assignment instructions, description, and requirements here..." 
                rows={8} 
                required 
              />
            </div>

            {inputMethod === 'manual' && (
              <div>
                <Label htmlFor="file">Or Upload Assignment File</Label>
                <div className="mt-2">
                  <input 
                    id="file" 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".txt,.doc,.docx,.pdf" 
                    className="hidden" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file')?.click()} 
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File (TXT, DOC, PDF)
                  </Button>
                  {file && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!canProceedFromContent}
              >
                Next Step <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Optional Details</h3>
              <p className="text-muted-foreground text-sm">Add subject and grade level for more targeted suggestions.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={handleSubjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English/Language Arts</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="art">Art</SelectItem>
                    <SelectItem value="custom">Custom Subject</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomSubject && (
                  <div className="mt-2">
                    <Input 
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      placeholder="Enter your specific subject (e.g., AP Biology, World Literature)"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                    <SelectItem value="middle">Middle School (6-8)</SelectItem>
                    <SelectItem value="high">High School (9-12)</SelectItem>
                    <SelectItem value="college">College/University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="time">Estimated Time to Complete</Label>
              <Input 
                id="time" 
                value={estimatedTime} 
                onChange={e => setEstimatedTime(e.target.value)} 
                placeholder="e.g., 2 weeks, 3 class periods" 
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Integration...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate AI Integration
                  </>
                )}
              </Button>
            </div>
          </div>
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