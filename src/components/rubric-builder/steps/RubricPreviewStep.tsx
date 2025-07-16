import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, Download, Save } from 'lucide-react';
import { RubricBuilderState } from '@/types/rubric';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RubricPreviewStepProps {
  state: RubricBuilderState;
  updateState: (updates: Partial<RubricBuilderState>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const RubricPreviewStep: React.FC<RubricPreviewStepProps> = ({
  state,
  updateState,
  onNext,
  onPrevious
}) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const resolveSubjectArea = () => {
    if (state.isCustomSubject && state.customSubject) {
      return state.customSubject;
    }
    return state.subjectArea || 'General';
  };

  const generateRubric = async () => {
    setGenerating(true);
    try {
      const resolvedSubjectArea = resolveSubjectArea();
      
      console.log('Generating rubric with params:', {
        assignmentContent: state.assignmentContent,
        rubricType: state.rubricType,
        pointsPossible: state.pointsPossible,
        subjectArea: resolvedSubjectArea,
        gradeLevel: state.gradeLevel,
        includeDiverAlignment: state.includeDiverAlignment
      });

      const { data, error } = await supabase.functions.invoke('generate-ai-rubric', {
        body: {
          assignmentContent: state.assignmentContent,
          rubricType: state.rubricType,
          pointsPossible: state.pointsPossible,
          subjectArea: resolvedSubjectArea,
          gradeLevel: state.gradeLevel,
          includeDiverAlignment: state.includeDiverAlignment
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Received data from edge function:', data);

      // The edge function returns the rubric data directly, not nested in a 'rubric' property
      if (data?.criteria) {
        updateState({ generatedRubric: data });
        toast({
          title: "Success",
          description: "AI rubric generated successfully!"
        });
      } else {
        throw new Error('Invalid rubric data received');
      }
    } catch (error) {
      console.error('Error generating rubric:', error);
      toast({
        title: "Error",
        description: `Failed to generate rubric: ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveRubric = async () => {
    if (!state.generatedRubric || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('rubrics')
        .insert({
          user_id: user.id,
          title: state.rubricTitle,
          description: state.subjectArea,
          rubric_type: state.rubricType,
          points_possible: state.pointsPossible,
          criteria: state.generatedRubric.criteria as any,
          performance_levels: state.generatedRubric.performanceLevels as any,
          source_content: state.assignmentContent,
          source_type: 'manual',
          diver_alignment: state.includeDiverAlignment ? state.generatedRubric.diverAlignment as any : null,
          ai_literacy_components: state.generatedRubric.aiLiteracyComponents as any,
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rubric saved to your library!"
      });
      
      onNext();
    } catch (error) {
      console.error('Error saving rubric:', error);
      toast({
        title: "Error", 
        description: "Failed to save rubric. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
            </div>
            
            <Button 
              onClick={generateRubric}
              disabled={generating}
              className="w-full"
              size="lg"
            >
              {generating ? (
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
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Rubric</span>
                <Badge variant="secondary">{state.rubricType}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={state.rubricTitle} 
                  onChange={(e) => updateState({ rubricTitle: e.target.value })}
                  placeholder="Rubric title"
                />
              </div>

              {state.generatedRubric.criteria?.map((criterion: any, index: number) => (
                <div key={index} className="space-y-2">
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">{criterion.name}</h4>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                    
                    <div className="grid gap-2">
                      {criterion.levels?.map((level: any, levelIndex: number) => (
                        <div key={levelIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                          <Badge variant="outline">{level.points} pts</Badge>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{level.name}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={saveRubric} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save to Library
                </>
              )}
            </Button>
          </div>
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

export default RubricPreviewStep;