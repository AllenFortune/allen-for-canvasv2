import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
interface AssignmentInputFormProps {
  onIntegrationGenerated: (integration: any, assignmentData: any) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
const AssignmentInputForm: React.FC<AssignmentInputFormProps> = ({
  onIntegrationGenerated,
  loading,
  setLoading
}) => {
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      // For now, we'll just show the file name
      // In a full implementation, we'd extract text from the file
      setAssignmentText(`[File uploaded: ${uploadedFile.name}]`);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentText.trim() || !assignmentTitle.trim()) {
      alert('Please provide both assignment title and content.');
      return;
    }
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-ai-assignment-integration', {
        body: {
          assignmentTitle,
          assignmentText,
          subject,
          gradeLevel,
          estimatedTime
        }
      });
      if (error) throw error;
      const assignmentData = {
        title: assignmentTitle,
        content: assignmentText,
        subject,
        gradeLevel,
        estimatedTime
      };
      onIntegrationGenerated(data, assignmentData);
    } catch (error) {
      console.error('Error generating integration:', error);
      alert('Failed to generate AI integration suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Assignment Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Title */}
          <div>
            <Label htmlFor="title">Assignment Title *</Label>
            <Input id="title" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} placeholder="Enter assignment title" required />
          </div>

          {/* Assignment Content */}
          <div>
            <Label htmlFor="content">Assignment Content *</Label>
            <Textarea id="content" value={assignmentText} onChange={e => setAssignmentText(e.target.value)} placeholder="Paste your assignment instructions, description, and requirements here..." rows={8} required />
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Or Upload Assignment File</Label>
            <div className="mt-2">
              <input id="file" type="file" onChange={handleFileUpload} accept=".txt,.doc,.docx,.pdf" className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById('file')?.click()} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload File (TXT, DOC, PDF)
              </Button>
              {file && <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English/Language Arts</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="social-studies">Social Studies</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                  <SelectItem value="middle">Middle School (6-8)</SelectItem>
                  <SelectItem value="high">High School (9-12)</SelectItem>
                  <SelectItem value="college">College/University</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="time">Estimated Time to Complete</Label>
            <Input id="time" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} placeholder="e.g., 2 weeks, 3 class periods" />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating AI Integration...
              </> : 'Generate AI Literacy Integration'}
          </Button>
        </form>
      </CardContent>
    </Card>;
};
export default AssignmentInputForm;