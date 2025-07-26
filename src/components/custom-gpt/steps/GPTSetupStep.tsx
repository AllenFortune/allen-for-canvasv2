import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Settings } from 'lucide-react';

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
  'Other'
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
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const isValid = data.name && data.description && data.subject_area && data.grade_level && data.purpose;

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
                <Select onValueChange={(value) => handleChange('subject_area', value)} value={data.subject_area}>
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

            <div className="space-y-2">
              <Label htmlFor="purpose">Primary Purpose *</Label>
              <Select onValueChange={(value) => handleChange('purpose', value)} value={data.purpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary purpose" />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((purpose) => (
                    <SelectItem key={purpose} value={purpose.toLowerCase().replace(/\s+/g, '_')}>
                      {purpose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
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