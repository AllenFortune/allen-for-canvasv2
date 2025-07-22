
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  classFormat: string;
  setClassFormat: (value: string) => void;
  assignmentType: string;
  setAssignmentType: (value: string) => void;
  completionLocation: string;
  setCompletionLocation: (value: string) => void;
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
  classFormat,
  setClassFormat,
  assignmentType,
  setAssignmentType,
  completionLocation,
  setCompletionLocation,
  onPrevious,
  onSubmit,
  loading
}) => {
  return (
    <div className="space-y-8 pb-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold mb-2">Assignment Context</h3>
        <p className="text-muted-foreground text-sm">Add context information for more targeted AI suggestions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
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
            <div className="mt-3">
              <Input 
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                placeholder="Enter your specific subject (e.g., AP Biology, World Literature)"
                className="text-sm"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
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

      <div className="space-y-2">
        <Label htmlFor="time">Estimated Time to Complete</Label>
        <Input 
          id="time" 
          value={estimatedTime} 
          onChange={e => setEstimatedTime(e.target.value)} 
          placeholder="e.g., 2 weeks, 3 class periods" 
        />
      </div>

      {/* Assignment Context Section with improved spacing */}
      <div className="space-y-6 pt-6 border-t">
        <h4 className="font-medium text-foreground mb-4">Assignment Context</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Class Format</Label>
            <RadioGroup value={classFormat} onValueChange={setClassFormat} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="text-sm font-normal cursor-pointer">Online Class</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="text-sm font-normal cursor-pointer">In-Person Class</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Assignment Type</Label>
            <RadioGroup value={assignmentType} onValueChange={setAssignmentType} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="discussion" id="discussion" />
                <Label htmlFor="discussion" className="text-sm font-normal cursor-pointer">Discussion</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="assignment" id="assignment" />
                <Label htmlFor="assignment" className="text-sm font-normal cursor-pointer">Assignment</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium">Completion Location</Label>
            <RadioGroup value={completionLocation} onValueChange={setCompletionLocation} className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="in-class" id="in-class" />
                <Label htmlFor="in-class" className="text-sm font-normal cursor-pointer">In-Class</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="outside-class" id="outside-class" />
                <Label htmlFor="outside-class" className="text-sm font-normal cursor-pointer">Outside Class</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
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
