import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Link2 } from 'lucide-react';

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: 'upload' | 'paste' | 'canvas';
  fileName?: string;
}

interface SyllabusInputStepProps {
  data: SyllabusData;
  onChange: (data: SyllabusData) => void;
}

const SyllabusInputStep: React.FC<SyllabusInputStepProps> = ({ data, onChange }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange({
          ...data,
          content,
          fileName: file.name,
          inputMethod: 'upload'
        });
      };
      reader.readAsText(file);
    }
  };

  const inputMethods = [
    {
      id: 'paste',
      title: 'Paste Content',
      description: 'Copy and paste your syllabus text',
      icon: FileText
    },
    {
      id: 'upload',
      title: 'Upload File',
      description: 'Upload a text or Word document',
      icon: Upload
    },
    {
      id: 'canvas',
      title: 'Import from Canvas',
      description: 'Connect to Canvas and import',
      icon: Link2,
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Choose Input Method</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {inputMethods.map((method) => {
            const Icon = method.icon;
            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-colors relative ${
                  data.inputMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                } ${method.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !method.comingSoon && onChange({ ...data, inputMethod: method.id as any })}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="font-medium text-foreground">{method.title}</div>
                  <div className="text-sm text-muted-foreground">{method.description}</div>
                  {method.comingSoon && (
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {data.inputMethod === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Syllabus File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Choose File (TXT, DOCX, PDF)</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
                {data.fileName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded: {data.fileName}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.inputMethod === 'paste' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paste Syllabus Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your syllabus content here..."
              value={data.content}
              onChange={(e) => onChange({ ...data, content: e.target.value })}
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>
      )}

      {data.inputMethod === 'canvas' && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              Canvas integration coming soon! For now, please copy your syllabus from Canvas and use the paste option.
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="course-name">Course Name *</Label>
            <Input
              id="course-name"
              placeholder="e.g., Introduction to Psychology"
              value={data.courseName}
              onChange={(e) => onChange({ ...data, courseName: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject Area</Label>
              <Input
                id="subject"
                placeholder="e.g., Biology, American History, Creative Writing"
                value={data.subject}
                onChange={(e) => onChange({ ...data, subject: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="grade-level">Grade Level</Label>
              <Select 
                value={data.gradeLevel} 
                onValueChange={(value) => onChange({ ...data, gradeLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="middle-school">Middle School</SelectItem>
                  <SelectItem value="high-school">High School</SelectItem>
                  <SelectItem value="college-intro">College Introductory</SelectItem>
                  <SelectItem value="college-intermediate">College Intermediate</SelectItem>
                  <SelectItem value="college-advanced">College Advanced</SelectItem>
                  <SelectItem value="graduate">Graduate Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SyllabusInputStep;