
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RubricBuilderState } from '@/types/rubric';

interface RubricOptionsStepProps {
  state: RubricBuilderState;
  updateState: (updates: Partial<RubricBuilderState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const RubricOptionsStep: React.FC<RubricOptionsStepProps> = ({ 
  state, 
  updateState, 
  onNext, 
  onPrev 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rubric Type</CardTitle>
          <CardDescription>Choose the type of rubric that best fits your assessment needs</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.rubricType}
            onValueChange={(value: 'analytic' | 'holistic' | 'single_point') => 
              updateState({ rubricType: value })
            }
            className="space-y-4"
          >
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="analytic" id="analytic" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="analytic" className="font-medium">Analytic Rubric</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Multiple criteria with separate performance levels for each. Best for detailed feedback on specific skills.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="holistic" id="holistic" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="holistic" className="font-medium">Holistic Rubric</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Single overall performance scale. Best for quick grading and overall assessment.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="single_point" id="single_point" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="single_point" className="font-medium">Single-Point Rubric</Label>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on proficiency with areas for growth and exceeding expectations. Great for standards-based grading.
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Points Configuration</CardTitle>
            <CardDescription>Set the total points for this rubric</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="points">Total Points Possible</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="1000"
                  value={state.pointsPossible}
                  onChange={(e) => updateState({ pointsPossible: parseInt(e.target.value) || 100 })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Context Information</CardTitle>
            <CardDescription>Help AI generate more relevant criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Area (Optional)</Label>
                <Select
                  value={state.subjectArea}
                  onValueChange={(value) => updateState({ subjectArea: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English Language Arts</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="social-studies">Social Studies</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="pe">Physical Education</SelectItem>
                    <SelectItem value="world-languages">World Languages</SelectItem>
                    <SelectItem value="cte">Career & Technical Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="grade">Grade Level (Optional)</Label>
                <Select
                  value={state.gradeLevel}
                  onValueChange={(value) => updateState({ gradeLevel: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="k-2">K-2</SelectItem>
                    <SelectItem value="3-5">3-5</SelectItem>
                    <SelectItem value="6-8">6-8</SelectItem>
                    <SelectItem value="9-12">9-12</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="adult">Adult Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Literacy Integration</CardTitle>
          <CardDescription>Include DIVER Framework criteria for responsible AI use assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="diver-alignment"
              checked={state.includeDiverAlignment}
              onCheckedChange={(checked) => updateState({ includeDiverAlignment: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="diver-alignment" className="font-medium">Include DIVER Framework Alignment</Label>
              <p className="text-sm text-gray-600 mt-1">
                Add criteria to assess students' responsible AI use: Define, Inquire, Verify, Evaluate, and Reflect on AI tools and outputs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button 
          onClick={onNext}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Generate Rubric
        </Button>
      </div>
    </div>
  );
};

export default RubricOptionsStep;
