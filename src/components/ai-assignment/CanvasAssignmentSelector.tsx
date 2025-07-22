import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, BookOpen, ExternalLink, Search, Check, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { groupCoursesByTerm, getTermDisplayName, type CourseWithTerm } from '@/utils/termUtils';

interface Course {
  id: number;
  name: string;
  course_code: string;
  term?: {
    id: number;
    name: string;
    start_at?: string | null;
    end_at?: string | null;
  };
  workflow_state?: string;
  start_at?: string | null;
  end_at?: string | null;
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
  // New props for export mode
  exportMode?: boolean;
  onAssignmentSelected?: (courseId: string, assignmentId: string) => void;
}

const CanvasAssignmentSelector: React.FC<CanvasAssignmentSelectorProps> = ({
  onAssignmentImported,
  loading,
  exportMode = false,
  onAssignmentSelected
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groupedCourses, setGroupedCourses] = useState<{ term: any; courses: CourseWithTerm[] }[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [importingAssignment, setImportingAssignment] = useState(false);
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [assignmentSearchOpen, setAssignmentSearchOpen] = useState(false);
  const { toast } = useToast();

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-courses');
      
      if (error) throw error;
      
      if (data?.courses) {
        setCourses(data.courses);
        const grouped = groupCoursesByTerm(data.courses);
        setGroupedCourses(grouped);
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

  const handleAssignmentChange = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    
    // In export mode, immediately notify parent of selection
    if (exportMode && onAssignmentSelected && selectedCourse) {
      onAssignmentSelected(selectedCourse, assignmentId);
    }
  };

  // In export mode, call onAssignmentImported with the selection info
  React.useEffect(() => {
    if (exportMode && selectedCourse && selectedAssignment && onAssignmentImported) {
      onAssignmentImported({
        title: '',
        content: '',
        courseId: selectedCourse,
        assignmentId: selectedAssignment
      });
    }
  }, [selectedCourse, selectedAssignment, exportMode, onAssignmentImported]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          {exportMode ? 'Select Canvas Assignment' : 'Import from Canvas'}
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
              <Popover open={courseSearchOpen} onOpenChange={setCourseSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={courseSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedCourse
                      ? courses.find((course) => course.id.toString() === selectedCourse)?.course_code + ' - ' + courses.find((course) => course.id.toString() === selectedCourse)?.name
                      : "Choose a Canvas course"}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-popover border">
                  <Command>
                    <CommandInput placeholder="Search courses..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No courses found.</CommandEmpty>
                      {groupedCourses.map(({ term, courses: termCourses }) => (
                        <CommandGroup key={term.termCode} heading={getTermDisplayName(term)}>
                          {termCourses.map((course) => (
                            <CommandItem
                              key={course.id}
                              value={`${course.course_code} ${course.name}`}
                              onSelect={() => {
                                handleCourseChange(course.id.toString());
                                setCourseSearchOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{course.course_code}</span>
                                <span className="text-sm text-muted-foreground">{course.name}</span>
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  selectedCourse === course.id.toString() ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                <Popover open={assignmentSearchOpen} onOpenChange={setAssignmentSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assignmentSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedAssignment
                        ? assignments.find((assignment) => assignment.id.toString() === selectedAssignment)?.name
                        : "Choose an assignment"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover border">
                    <Command>
                      <CommandInput placeholder="Search assignments..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No assignments found.</CommandEmpty>
                        <CommandGroup>
                          {assignments.map((assignment) => (
                            <CommandItem
                              key={assignment.id}
                              value={assignment.name}
                              onSelect={() => {
                                handleAssignmentChange(assignment.id.toString());
                                setAssignmentSearchOpen(false);
                              }}
                            >
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{assignment.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {assignment.points_possible ? `${assignment.points_possible} points` : 'No points'} 
                                  {assignment.due_at && ` • Due: ${new Date(assignment.due_at).toLocaleDateString()}`}
                                </span>
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  selectedAssignment === assignment.id.toString() ? "opacity-100" : "opacity-0"
                                }`}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {!exportMode && selectedAssignment && (
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
                setGroupedCourses([]);
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
