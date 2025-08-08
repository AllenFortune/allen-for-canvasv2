import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Monitor, ArrowRight } from 'lucide-react';
import CanvasAssignmentSelector from '../CanvasAssignmentSelector';

interface MethodSelectionStepProps {
  inputMethod: 'manual' | 'canvas';
  setInputMethod: (method: 'manual' | 'canvas') => void;
  onCanvasAssignmentImported: (assignment: any) => void;
  onNext: () => void;
  canProceed: boolean;
  loading: boolean;
}

const MethodSelectionStep: React.FC<MethodSelectionStepProps> = ({
  inputMethod,
  setInputMethod,
  onCanvasAssignmentImported,
  onNext,
  canProceed,
  loading
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">How would you like to input your assignment or discussion?</h3>
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
            <p className="text-sm text-muted-foreground">Select an existing assignment or discussion from Canvas</p>
          </CardContent>
        </Card>
      </div>

      {inputMethod === 'canvas' && (
        <div className="mt-6">
          <CanvasAssignmentSelector 
            onAssignmentImported={onCanvasAssignmentImported}
            loading={loading}
          />
        </div>
      )}

      <div className="flex justify-end pt-4">
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

export default MethodSelectionStep;