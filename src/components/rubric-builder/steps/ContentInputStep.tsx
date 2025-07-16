
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Globe } from 'lucide-react';
import { RubricBuilderState } from '@/types/rubric';
import CanvasAssignmentSelector from '@/components/ai-assignment/CanvasAssignmentSelector';

interface ContentInputStepProps {
  state: RubricBuilderState;
  updateState: (updates: Partial<RubricBuilderState>) => void;
  onNext: () => void;
}

const ContentInputStep: React.FC<ContentInputStepProps> = ({ state, updateState, onNext }) => {
  const [fileContent, setFileContent] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
        updateState({ assignmentContent: content });
      };
      reader.readAsText(file);
    }
  };

  const canProceed = () => {
    switch (state.inputMethod) {
      case 'canvas':
        return state.selectedAssignment !== null;
      case 'manual':
        return state.assignmentContent.trim().length > 50;
      case 'file':
        return fileContent.trim().length > 50;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">How would you like to provide assignment content?</h3>
        <RadioGroup
          value={state.inputMethod}
          onValueChange={(value: 'canvas' | 'manual' | 'file') => updateState({ inputMethod: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem value="canvas" id="canvas" className="peer sr-only" />
            <Label
              htmlFor="canvas"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Globe className="mb-3 h-6 w-6" />
              <span className="font-medium">Canvas Assignment</span>
              <span className="text-sm text-muted-foreground text-center">Import from your Canvas courses</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
            <Label
              htmlFor="manual"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <FileText className="mb-3 h-6 w-6" />
              <span className="font-medium">Manual Input</span>
              <span className="text-sm text-muted-foreground text-center">Paste assignment content directly</span>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem value="file" id="file" className="peer sr-only" />
            <Label
              htmlFor="file"
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Upload className="mb-3 h-6 w-6" />
              <span className="font-medium">File Upload</span>
              <span className="text-sm text-muted-foreground text-center">Upload assignment document</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {state.inputMethod === 'canvas' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Canvas Assignment</CardTitle>
            <CardDescription>Choose an assignment from your Canvas courses to generate a rubric for</CardDescription>
          </CardHeader>
          <CardContent>
            <CanvasAssignmentSelector
              onAssignmentImported={(assignment) => {
                updateState({ 
                  selectedAssignment: assignment,
                  assignmentContent: assignment.content || assignment.title 
                });
              }}
              loading={false}
            />
          </CardContent>
        </Card>
      )}

      {state.inputMethod === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Assignment Content</CardTitle>
            <CardDescription>Paste your assignment description, instructions, or learning objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your assignment content here... Include instructions, learning objectives, requirements, and any other relevant details that should inform the rubric creation."
              value={state.assignmentContent}
              onChange={(e) => updateState({ assignmentContent: e.target.value })}
              className="min-h-[200px]"
            />
            <div className="mt-2 text-sm text-gray-500">
              {state.assignmentContent.length} characters (minimum 50 required)
            </div>
          </CardContent>
        </Card>
      )}

      {state.inputMethod === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Assignment File</CardTitle>
            <CardDescription>Upload a text file containing your assignment content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              {fileContent && (
                <div>
                  <Label className="text-sm font-medium">File Content Preview:</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{fileContent.substring(0, 500)}...</pre>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {fileContent.length} characters loaded
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!canProceed()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Next: Configure Options
        </Button>
      </div>
    </div>
  );
};

export default ContentInputStep;
