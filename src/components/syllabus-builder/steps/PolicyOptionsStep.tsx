import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, BookOpen, Quote, Target } from 'lucide-react';

interface PolicyOptions {
  includeAcademicIntegrity: boolean;
  includePermittedUses: boolean;
  includeCitationGuidelines: boolean;
  includeAssignmentSpecific: boolean;
  policyTone: 'formal' | 'friendly' | 'balanced';
  enforcementLevel: 'strict' | 'moderate' | 'flexible';
}

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: 'upload' | 'paste' | 'canvas';
  fileName?: string;
}

interface PolicyOptionsStepProps {
  options: PolicyOptions;
  onChange: (options: PolicyOptions) => void;
  syllabusData: SyllabusData;
}

const PolicyOptionsStep: React.FC<PolicyOptionsStepProps> = ({ options, onChange, syllabusData }) => {
  const updateOption = (key: keyof PolicyOptions, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const policyComponents = [
    {
      id: 'includeAcademicIntegrity',
      title: 'Academic Integrity Guidelines',
      description: 'Clear policies on plagiarism, academic honesty, and AI attribution',
      icon: Shield,
      recommended: true
    },
    {
      id: 'includePermittedUses',
      title: 'Permitted AI Uses',
      description: 'Specific examples of allowed and prohibited AI applications',
      icon: BookOpen,
      recommended: true
    },
    {
      id: 'includeCitationGuidelines',
      title: 'Citation Requirements',
      description: 'How to properly cite AI assistance and generated content',
      icon: Quote,
      recommended: true
    },
    {
      id: 'includeAssignmentSpecific',
      title: 'Assignment-Specific Rules',
      description: 'Tailored policies for different types of coursework',
      icon: Target,
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select Policy Components</h3>
        <p className="text-muted-foreground mb-4">
          Choose which AI policy elements to include in your syllabus. Recommended components are pre-selected.
        </p>
        
        <div className="grid gap-4">
          {policyComponents.map((component) => {
            const Icon = component.icon;
            const isEnabled = options[component.id as keyof PolicyOptions] as boolean;
            
            return (
              <Card key={component.id} className={`transition-colors ${isEnabled ? 'bg-primary/5 border-primary/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={component.id} className="font-medium cursor-pointer">
                          {component.title}
                        </Label>
                        {component.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {component.description}
                      </p>
                    </div>
                    
                    <Switch
                      id={component.id}
                      checked={isEnabled}
                      onCheckedChange={(checked) => updateOption(component.id as keyof PolicyOptions, checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policy Customization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="policy-tone">Policy Tone</Label>
            <Select 
              value={options.policyTone} 
              onValueChange={(value: 'formal' | 'friendly' | 'balanced') => updateOption('policyTone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal - Traditional academic language</SelectItem>
                <SelectItem value="balanced">Balanced - Professional yet approachable</SelectItem>
                <SelectItem value="friendly">Friendly - Conversational and supportive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="enforcement-level">Enforcement Level</Label>
            <Select 
              value={options.enforcementLevel} 
              onValueChange={(value: 'strict' | 'moderate' | 'flexible') => updateOption('enforcementLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict - Clear consequences and zero tolerance</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced approach with warnings</SelectItem>
                <SelectItem value="flexible">Flexible - Emphasis on learning and growth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Context Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Course:</strong> {syllabusData.courseName || 'Your Course'}<br />
              <strong>Subject:</strong> {syllabusData.subject || 'Not specified'}<br />
              <strong>Level:</strong> {syllabusData.gradeLevel || 'Not specified'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These details will be used to create contextually appropriate AI policies for your course.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyOptionsStep;