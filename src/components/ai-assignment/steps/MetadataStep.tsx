import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, FileText } from 'lucide-react';

interface MetadataStepProps {
  subject: string;
  onSubjectChange: (value: string) => void;
  customSubject: string;
  setCustomSubject: (value: string) => void;
  isCustomSubject: boolean;
  gradeLevel: string;
  setGradeLevel: (value: string) => void;
  estimatedTime: string;
  setEstimatedTime: (value: string) => void;
  onPrevious: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const MetadataStep: React.FC<MetadataStepProps> = ({
  subject,
  onSubjectChange,
  customSubject,
  setCustomSubject,
  isCustomSubject,
  gradeLevel,
  setGradeLevel,
  estimatedTime,
  setEstimatedTime,
  onPrevious,
  onSubmit,
  loading
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Optional Details</h3>
        <p className="text-muted-foreground text-sm">Add subject and grade level for more targeted suggestions.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject} onValueChange={onSubjectChange}>
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
              <SelectItem value="custom">Custom Subject</SelectItem>
            </SelectContent>
          </Select>
          {isCustomSubject && (
            <div className="mt-2">
              <Input 
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                placeholder="Enter your specific subject (e.g., AP Biology, World Literature)"
                className="text-sm"
              />
            </div>
          )}
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
        <Input 
          id="time" 
          value={estimatedTime} 
          onChange={e => setEstimatedTime(e.target.value)} 
          placeholder="e.g., 2 weeks, 3 class periods" 
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={loading}
          className="bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating AI Integration...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate AI Integration
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MetadataStep;