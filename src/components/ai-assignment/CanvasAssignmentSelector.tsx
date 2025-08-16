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

interface Discussion {
  id: number;
  title: string;
  is_assignment?: boolean;
  needs_grading_count?: number;
  assignment_id?: number | null;
  posted_at?: string | null;
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
    discussionId?: string;
    type?: 'assignment' | 'discussion';
  }) => void;
  loading: boolean;
  // New props for export mode
  exportMode?: boolean;
  onAssignmentSelected?: (courseId: string, assignmentId: string, type: 'assignment' | 'discussion') => void;
}

const CanvasAssignmentSelector: React.FC<CanvasAssignmentSelectorProps> = ({
  onAssignmentImported,
  loading,
  exportMode = false,
  onAssignmentSelected
}) => {
  const [mode, setMode] = useState<'assignments' | 'discussions'>('assignments');
  const [courses, setCourses] = useState<Course[]>([]);
  const [groupedCourses, setGroupedCourses] = useState<{ term: any; courses: CourseWithTerm[] }[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [selectedDiscussion, setSelectedDiscussion] = useState<string>('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingDiscussions, setLoadingDiscussions] = useState(false);
  const [importingAssignment, setImportingAssignment] = useState(false);
  const [courseSearchOpen, setCourseSearchOpen] = useState(false);
  const [assignmentSearchOpen, setAssignmentSearchOpen] = useState(false);
  const [discussionSearchOpen, setDiscussionSearchOpen] = useState(false);
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

  const fetchDiscussions = async (courseId: string) => {
    if (!courseId) return;
    setLoadingDiscussions(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-discussions', {
        body: { courseId }
      });
      
      if (error) throw error;
      
      if (data?.discussions) {
        setDiscussions(data.discussions);
      } else {
        throw new Error('No discussions data received');
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Canvas discussions.",
        variant: "destructive"
      });
    } finally {
      setLoadingDiscussions(false);
    }
  };

  const importSelection = async () => {
    if (!selectedCourse) return;
    
    setImportingAssignment(true);
    try {
      if (mode === 'assignments') {
        if (!selectedAssignment) return;
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
            assignmentId: selectedAssignment,
            type: 'assignment'
          });
          
          toast({
            title: "Success",
            description: "Assignment imported from Canvas successfully!"
          });
        }
      } else {
        if (!selectedDiscussion) return;
        const { data, error } = await supabase.functions.invoke('import-canvas-discussion', {
          body: {
            courseId: selectedCourse,
            discussionId: selectedDiscussion
          }
        });

        if (error) throw error;

        if (data?.discussion) {
          const discussion = data.discussion;
          onAssignmentImported({
            title: discussion.title,
            content: discussion.message || '',
            subject: courses.find(c => c.id.toString() === selectedCourse)?.name,
            estimatedTime: discussion.due_at ? `Due: ${new Date(discussion.due_at).toLocaleDateString()}` : undefined,
            courseId: selectedCourse,
            discussionId: discussion.id, // Use the actual discussion ID from Canvas response
            assignmentId: discussion.assignment_id, // Include the assignment ID if available
            type: 'discussion'
          });

          toast({
            title: "Success",
            description: "Discussion imported from Canvas successfully!"
          });
        }
      }
    } catch (error) {
      console.error('Error importing from Canvas:', error);
      toast({
        title: "Error",
        description: "Failed to import from Canvas.",
        variant: "destructive"
      });
    } finally {
      setImportingAssignment(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedAssignment('');
    setSelectedDiscussion('');
    setAssignments([]);
    setDiscussions([]);
    if (courseId) {
      if (mode === 'assignments') {
        fetchAssignments(courseId);
      } else {
        fetchDiscussions(courseId);
      }
    }
  };

  const handleAssignmentChange = (assignmentId: string) => {
    setSelectedAssignment(assignmentId);
    
    // In export mode, immediately notify parent of selection
    if (exportMode && onAssignmentSelected && selectedCourse) {
      onAssignmentSelected(selectedCourse, assignmentId, 'assignment');
    }
  };

  const handleDiscussionChange = (discussionId: string) => {
    setSelectedDiscussion(discussionId);
    
    // In export mode, immediately notify parent of selection
    if (exportMode && onAssignmentSelected && selectedCourse) {
      onAssignmentSelected(selectedCourse, discussionId, 'discussion');
    }
  };

  // In export mode, call onAssignmentImported with the selection info
  React.useEffect(() => {
    if (exportMode && selectedCourse && onAssignmentImported) {
      if (mode === 'assignments' && selectedAssignment) {
        onAssignmentImported({
          title: '',
          content: '',
          courseId: selectedCourse,
          assignmentId: selectedAssignment,
          type: 'assignment'
        });
      } else if (mode === 'discussions' && selectedDiscussion) {
        onAssignmentImported({
          title: '',
          content: '',
          courseId: selectedCourse,
          discussionId: selectedDiscussion,
          type: 'discussion'
        });
      }
    }
  }, [selectedCourse, selectedAssignment, selectedDiscussion, mode, exportMode, onAssignmentImported]);

  React.useEffect(() => {
    if (selectedCourse) {
      if (mode === 'assignments') {
        fetchAssignments(selectedCourse);
      } else {
        fetchDiscussions(selectedCourse);
      }
    }
  }, [mode, selectedCourse]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-6 h-6 mr-2" />
          {exportMode ? 'Select Canvas Assignment or Discussion' : 'Import from Canvas'}
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
            <div className="flex items-center justify-center gap-2">
              <Button variant={mode === 'assignments' ? 'default' : 'outline'} size="sm" onClick={() => setMode('assignments')}>
                Assignments
              </Button>
              <Button variant={mode === 'discussions' ? 'default' : 'outline'} size="sm" onClick={() => setMode('discussions')}>
                Discussions
              </Button>
            </div>
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
                <PopoverContent className="w-full p-0 bg-popover border z-50">
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

            {(mode === 'assignments' ? loadingAssignments : loadingDiscussions) && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'assignments' ? 'Loading assignments...' : 'Loading discussions...'}
              </div>
            )}

            {mode === 'assignments' && assignments.length > 0 && (
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
                  <PopoverContent className="w-full p-0 bg-popover border z-50">
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

            {mode === 'discussions' && discussions.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Discussion</label>
                <Popover open={discussionSearchOpen} onOpenChange={setDiscussionSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={discussionSearchOpen}
                      className="w-full justify-between"
                    >
                      {selectedDiscussion
                        ? discussions.find((d) => d.id.toString() === selectedDiscussion)?.title
                        : "Choose a discussion"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-popover border z-50">
                    <Command>
                      <CommandInput placeholder="Search discussions..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No discussions found.</CommandEmpty>
                        <CommandGroup>
                          {discussions.map((discussion) => (
                            <CommandItem
                              key={discussion.id}
                              value={discussion.title}
                              onSelect={() => {
                                handleDiscussionChange(discussion.id.toString());
                                setDiscussionSearchOpen(false);
                              }}
                            >
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{discussion.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {discussion.is_assignment ? 'Graded discussion' : 'Ungraded discussion'}
                                </span>
                              </div>
                              <Check
                                className={`ml-auto h-4 w-4 ${
                                  selectedDiscussion === discussion.id.toString() ? "opacity-100" : "opacity-0"
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

            {!exportMode && ((mode === 'assignments' && selectedAssignment) || (mode === 'discussions' && selectedDiscussion)) && (
              <Button 
                onClick={importSelection}
                disabled={importingAssignment || loading}
                className="w-full"
              >
                {importingAssignment ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing {mode === 'assignments' ? 'Assignment' : 'Discussion'}...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Import {mode === 'assignments' ? 'Assignment' : 'Discussion'}
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
