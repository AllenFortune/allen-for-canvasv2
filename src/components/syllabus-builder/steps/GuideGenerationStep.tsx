import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, Users, Download } from 'lucide-react';

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: 'upload' | 'paste' | 'canvas';
  fileName?: string;
}

interface PolicyOptions {
  includeAcademicIntegrity: boolean;
  includePermittedUses: boolean;
  includeCitationGuidelines: boolean;
  includeAssignmentSpecific: boolean;
  policyTone: 'formal' | 'friendly' | 'balanced';
  enforcementLevel: 'strict' | 'moderate' | 'flexible';
}

interface GuideGenerationStepProps {
  syllabusData: SyllabusData;
  policyOptions: PolicyOptions;
  onGenerate: () => void;
  loading: boolean;
}

const GuideGenerationStep: React.FC<GuideGenerationStepProps> = ({
  syllabusData,
  policyOptions,
  onGenerate,
  loading
}) => {
  const enabledPolicies = Object.entries(policyOptions)
    .filter(([key, value]) => key.startsWith('include') && value)
    .map(([key]) => key.replace('include', '').replace(/([A-Z])/g, ' $1').trim());

  const outputs = [
    {
      title: 'Enhanced Syllabus',
      description: 'Your original syllabus with integrated AI policies and guidelines',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'AI Policy Document',
      description: 'Standalone policy document for distribution and reference',
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      title: 'Student Use Guide',
      description: 'Step-by-step guide for students on responsible AI use',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Canvas Resources',
      description: 'Ready-to-import content modules for your LMS',
      icon: Download,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate Your AI Resources</h3>
        <p className="text-muted-foreground">
          Review your selections below, then click generate to create your customized AI policies and guides.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generation Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Course Details</h4>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p><strong>Course:</strong> {syllabusData.courseName}</p>
              <p><strong>Subject:</strong> {syllabusData.subject || 'Not specified'}</p>
              <p><strong>Level:</strong> {syllabusData.gradeLevel || 'Not specified'}</p>
              <p><strong>Input Method:</strong> {syllabusData.inputMethod === 'upload' ? `File (${syllabusData.fileName})` : 'Pasted Content'}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Selected Policies</h4>
            <div className="flex flex-wrap gap-2">
              {enabledPolicies.map((policy) => (
                <Badge key={policy} variant="secondary">
                  {policy}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-foreground mb-2">Customization</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted p-2 rounded">
                <strong>Tone:</strong> {policyOptions.policyTone}
              </div>
              <div className="bg-muted p-2 rounded">
                <strong>Enforcement:</strong> {policyOptions.enforcementLevel}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What Will Be Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {outputs.map((output) => {
              const Icon = output.icon;
              return (
                <div key={output.title} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Icon className={`w-5 h-5 mt-0.5 ${output.color}`} />
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{output.title}</h4>
                    <p className="text-xs text-muted-foreground">{output.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button 
          onClick={onGenerate} 
          disabled={loading}
          size="lg"
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Your AI Resources...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Policies & Guides
            </>
          )}
        </Button>
        
        {loading && (
          <p className="text-sm text-muted-foreground mt-2">
            This may take a few moments while we create your customized content.
          </p>
        )}
      </div>
    </div>
  );
};

export default GuideGenerationStep;