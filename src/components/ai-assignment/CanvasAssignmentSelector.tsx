import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  name: string;
  course_code: string;
}

interface Assignment {
  id: number;
  name: string;
  description: string;
  points_possible: number;
  due_at: string | null;
  submission_types: string[];
}

interface CanvasAssignmentSelectorProps {
  onAssignmentImported: (assignment: {
    title: string;
    content: string;
    subject?: string;
    gradeLevel?: string;
    estimatedTime?: string;
    courseId?: string;
    assignmentId?: string;
  }) => void;
  loading: boolean;
}

const CanvasAssignmentSelector: React.FC<CanvasAssignmentSelectorProps> = ({
  onAssignmentImported,
  loading
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [importingAssignment, setImportingAssignment] = useState(false);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-courses');
      
      if (error) throw error;
      
      if (data?.courses) {
        setCourses(data.courses);
      } else {
        throw new Error('No courses data received');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Canvas courses. Please check your Canvas connection.",
        variant: "destructive"
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchAssignments = async (courseId: string) => {
    if (!courseId) return;
    
    setLoadingAssignments(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-assignments', {
        body: { courseId }
      });
      
      if (error) throw error;
      
      if (data?.assignments) {
        setAssignments(data.assignments);
      } else {
        throw new Error('No assignments data received');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Canvas assignments.",
        variant: "destructive"
      });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const importAssignment = async () => {
    if (!selectedCourse || !selectedAssignment) return;
    
    setImportingAssignment(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-canvas-assignment', {
        body: { 
          courseId: selectedCourse,
          assignmentId: selectedAssignment
        }
      });
      
      if (error) throw error;
      
      if (data?.assignment) {
        const assignment = data.assignment;
        onAssignmentImported({
          title: assignment.name,
          content: assignment.description || '',
          subject: courses.find(c => c.id.toString() === selectedCourse)?.name,
          estimatedTime: assignment.due_at ? `Due: ${new Date(assignment.due_at).toLocaleDateString()}` : undefined,
          courseId: selectedCourse,
          assignmentId: selectedAssignment
        });
        
        toast({
          title: "Success",
          description: "Assignment imported from Canvas successfully!"
        });
      }
    } catch (error) {
      console.error('Error importing assignment:', error);
      toast({
        title: "Error",
        description: "Failed to import assignment from Canvas.",
        variant: "destructive"
      });
    } finally {
      setImportingAssignment(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedAssignment('');
    setAssignments([]);
    if (courseId) {
      fetchAssignments(courseId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          Import from Canvas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.length === 0 ? (
          <Button 
            onClick={fetchCourses} 
            disabled={loadingCourses || loading}
            className="w-full"
          >
            {loadingCourses ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading Courses...
              </>
            ) : (
              'Load Canvas Courses'
            )}
          </Button>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">Select Course</label>
              <Select value={selectedCourse} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Canvas course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loadingAssignments && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading assignments...
              </div>
            )}

            {assignments.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Assignment</label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id.toString()}>
                        <div className="flex flex-col">
                          <span>{assignment.name}</span>
                          <span className="text-xs text-gray-500">
                            {assignment.points_possible ? `${assignment.points_possible} points` : 'No points'} 
                            {assignment.due_at && ` • Due: ${new Date(assignment.due_at).toLocaleDateString()}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAssignment && (
              <Button 
                onClick={importAssignment}
                disabled={importingAssignment || loading}
                className="w-full"
              >
                {importingAssignment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing Assignment...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Import Assignment
                  </>
                )}
              </Button>
            )}

            <Button 
              variant="outline" 
              onClick={() => {
                setCourses([]);
                setAssignments([]);
                setSelectedCourse('');
                setSelectedAssignment('');
              }}
              className="w-full"
            >
              Choose Different Courses
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CanvasAssignmentSelector;