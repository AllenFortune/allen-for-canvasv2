import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from 'lucide-react';
import { RubricBuilderState } from '@/types/rubric';

interface RubricGeneratorProps {
  state: RubricBuilderState;
  isGenerating: boolean;
  onGenerate: () => void;
}

const RubricGenerator: React.FC<RubricGeneratorProps> = ({
  state,
  isGenerating,
  onGenerate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Generate Rubric
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Source:</strong> Assignment Content</p>
          <p><strong>Type:</strong> {state.rubricType}</p>
          <p><strong>Points:</strong> {state.pointsPossible}</p>
          {state.subjectArea && <p><strong>Subject:</strong> {state.subjectArea}</p>}
          {state.gradeLevel && <p><strong>Grade Level:</strong> {state.gradeLevel}</p>}
          {state.includeDiverAlignment && <p><strong>DIVER Framework:</strong> Enabled</p>}
        </div>
        
        <Button 
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Rubric...
            </>
          ) : (
            'Generate AI Rubric'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RubricGenerator;