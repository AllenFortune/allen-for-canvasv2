import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bot, Settings, Sparkles, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GPTSetupStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

const subjectAreas = [
  'Mathematics',
  'Science',
  'English Language Arts',
  'History',
  'Social Studies',
  'Computer Science',
  'Foreign Languages',
  'Art',
  'Music',
  'Physical Education',
  'Custom Subject'
];

const gradeLevels = [
  'Elementary (K-5)',
  'Middle School (6-8)',
  'High School (9-12)',
  'College/University',
  'Adult Education',
  'Mixed Levels'
];

const purposes = [
  'Homework Help',
  'Concept Explanation',
  'Problem Solving',
  'Research Assistance',
  'Study Companion',
  'Writing Support',
  'Math Tutoring',
  'Test Preparation',
  'Project Guidance',
  'General Academic Support'
];

export const GPTSetupStep: React.FC<GPTSetupStepProps> = ({ data, onUpdate, onNext }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCustomSubject, setIsCustomSubject] = useState(data.subject_area === 'custom_subject');
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const handleSubjectChange = (value: string) => {
    const isCustom = value === 'custom_subject';
    setIsCustomSubject(isCustom);
    
    if (isCustom) {
      handleChange('subject_area', '');
      handleChange('custom_subject', '');
    } else {
      handleChange('subject_area', value);
      handleChange('custom_subject', '');
    }
  };

  const handleCustomSubjectChange = (value: string) => {
    handleChange('custom_subject', value);
    handleChange('subject_area', value);
  };

  const handlePurposeChange = (purposeValue: string, checked: boolean) => {
    const currentPurposes = data.purposes || [];
    let updatedPurposes;
    
    if (checked) {
      updatedPurposes = [...currentPurposes, purposeValue];
    } else {
      updatedPurposes = currentPurposes.filter((p: string) => p !== purposeValue);
    }
    
    onUpdate({ purposes: updatedPurposes });
  };

  const removePurpose = (purposeToRemove: string) => {
    const currentPurposes = data.purposes || [];
    const updatedPurposes = currentPurposes.filter((p: string) => p !== purposeToRemove);
    onUpdate({ purposes: updatedPurposes });
  };

  const canGenerateDescription = data.name && data.subject_area && data.grade_level && data.purposes?.length > 0;
  const isValid = data.name && data.description && data.subject_area && data.grade_level && data.purposes?.length > 0;

  const generateDescription = async () => {
    if (!canGenerateDescription || isGenerating) return;

    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-gpt-description', {
        body: {
          name: data.name,
          subjectArea: data.subject_area,
          gradeLevel: data.grade_level,
          purposes: data.purposes
        }
      });

      if (error) throw error;

      if (result?.description) {
        // If description already exists, ask user before replacing
        if (data.description && data.description.trim()) {
          const shouldReplace = window.confirm(
            'You already have a description. Would you like to replace it with the AI-generated one?'
          );
          if (!shouldReplace) {
            setIsGenerating(false);
            return;
          }
        }
        
        handleChange('description', result.description);
        toast({
          title: "Description Generated",
          description: "AI has created a description for your teaching assistant.",
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Basic GPT Configuration</h3>
          <p className="text-muted-foreground">Set up the fundamental details of your teaching assistant</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Information
            </CardTitle>
            <CardDescription>
              Provide basic details about your teaching assistant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">GPT Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Math Tutor for Algebra I"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject_area">Subject Area *</Label>
                <Select onValueChange={handleSubjectChange} value={isCustomSubject ? 'custom_subject' : data.subject_area}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject area" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectAreas.map((subject) => (
                      <SelectItem key={subject} value={subject.toLowerCase().replace(/\s+/g, '_')}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isCustomSubject && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter your subject area..."
                      value={data.custom_subject || ''}
                      onChange={(e) => handleCustomSubjectChange(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level *</Label>
                <Select onValueChange={(value) => handleChange('grade_level', value)} value={data.grade_level}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade} value={grade.toLowerCase().replace(/\s+/g, '_').replace(/\([^)]*\)/g, '').trim()}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Primary Purposes *</Label>
                <p className="text-sm text-muted-foreground">Select all purposes this teaching assistant will serve (choose multiple)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {purposes.map((purpose) => {
                  const purposeValue = purpose.toLowerCase().replace(/\s+/g, '_');
                  const isSelected = data.purposes?.includes(purposeValue) || false;
                  
                  return (
                    <div key={purpose} className="flex items-center space-x-2">
                      <Checkbox
                        id={purposeValue}
                        checked={isSelected}
                        onCheckedChange={(checked) => handlePurposeChange(purposeValue, checked as boolean)}
                      />
                      <Label 
                        htmlFor={purposeValue} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {purpose}
                      </Label>
                    </div>
                  );
                })}
              </div>

              {data.purposes && data.purposes.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selected Purposes ({data.purposes.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {data.purposes.map((purposeValue: string) => {
                      const purposeLabel = purposes.find(p => 
                        p.toLowerCase().replace(/\s+/g, '_') === purposeValue
                      ) || purposeValue;
                      
                      return (
                        <Badge 
                          key={purposeValue} 
                          variant="secondary" 
                          className="flex items-center gap-1"
                        >
                          {purposeLabel}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removePurpose(purposeValue)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={!canGenerateDescription || isGenerating}
                  className="h-8 px-3"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  {isGenerating ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Describe what your teaching assistant will help students with..."
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          Continue to Knowledge Base
        </Button>
      </div>
    </div>
  );
};