import React from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowRight, ArrowLeft } from 'lucide-react';

interface ContentInputStepProps {
  assignmentTitle: string;
  setAssignmentTitle: (title: string) => void;
  assignmentText: string;
  setAssignmentText: (text: string) => void;
  inputMethod: 'manual' | 'canvas';
  file: File | null;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

const ContentInputStep: React.FC<ContentInputStepProps> = ({
  assignmentTitle,
  setAssignmentTitle,
  assignmentText,
  setAssignmentText,
  inputMethod,
  file,
  onFileUpload,
  onNext,
  onPrevious,
  canProceed
}) => {
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
              onChange={onFileUpload} 
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
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button 
          onClick={onNext}
          disabled={!canProceed}
        >
          Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ContentInputStep;