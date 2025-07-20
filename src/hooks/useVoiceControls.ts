import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  pattern: RegExp;
  action: (matches: RegExpMatchArray, context?: any) => void;
  description: string;
  context?: string[];
}

interface VoiceControlsState {
  isListening: boolean;
  isSupported: boolean;
  isActive: boolean;
  transcript: string;
  error: string | null;
}

export const useVoiceControls = (context?: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [state, setState] = useState<VoiceControlsState>({
    isListening: false,
    isSupported: false,
    isActive: false,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Helper function to find courses by name or code
  const findCourseByQuery = useCallback((query: string) => {
    console.log('Voice Command Debug - findCourseByQuery called with:', query);
    console.log('Voice Command Debug - context.courses:', context?.courses);
    
    if (!context?.courses || !Array.isArray(context.courses)) {
      console.log('Voice Command Debug - No courses found in context');
      return null;
    }

    console.log('Voice Command Debug - Available courses:', context.courses.map((c: any) => ({ id: c.id, name: c.name, course_code: c.course_code })));

    const normalizedQuery = query.toLowerCase().trim();
    console.log('Voice Command Debug - Normalized query:', normalizedQuery);
    
    // First try exact name matches
    let course = context.courses.find((c: any) => 
      c.name.toLowerCase() === normalizedQuery
    );
    
    if (course) {
      console.log('Voice Command Debug - Found exact name match:', course.name);
      return course;
    }

    // Try exact course code matches
    course = context.courses.find((c: any) => 
      c.course_code && c.course_code.toLowerCase() === normalizedQuery
    );
    
    if (course) {
      console.log('Voice Command Debug - Found exact code match:', course.name);
      return course;
    }

    // Try partial name matches (contains)
    course = context.courses.find((c: any) => 
      c.name.toLowerCase().includes(normalizedQuery)
    );
    
    if (course) {
      console.log('Voice Command Debug - Found partial name match:', course.name);
      return course;
    }

    // Try partial code matches (contains) 
    course = context.courses.find((c: any) => 
      c.course_code && c.course_code.toLowerCase().includes(normalizedQuery)
    );
    
    if (course) {
      console.log('Voice Command Debug - Found partial code match:', course.name);
      return course;
    }

    // Try word-by-word matching for more flexible search
    const queryWords = normalizedQuery.split(/\s+/);
    console.log('Voice Command Debug - Query words:', queryWords);
    
    course = context.courses.find((c: any) => {
      const nameWords = c.name.toLowerCase().split(/\s+/);
      const codeWords = c.course_code ? c.course_code.toLowerCase().split(/\s+/) : [];
      
      // Check if all query words are found in the course name or code
      const allWordsFound = queryWords.every(queryWord => 
        nameWords.some(nameWord => nameWord.includes(queryWord)) ||
        codeWords.some(codeWord => codeWord.includes(queryWord))
      );
      
      if (allWordsFound) {
        console.log('Voice Command Debug - Found word-by-word match:', c.name);
        return true;
      }
      
      return false;
    });

    if (!course) {
      console.log('Voice Command Debug - No course found for query:', query);
      console.log('Voice Command Debug - Available course names:', context.courses.map((c: any) => c.name));
    }

    return course;
  }, [context?.courses]);

  // Helper function to find assignments by name
  const findAssignmentByQuery = useCallback((query: string) => {
    console.log('Voice Command Debug - findAssignmentByQuery called with:', query);
    console.log('Voice Command Debug - context.assignments:', context?.assignments);
    
    if (!context?.assignments || !Array.isArray(context.assignments)) {
      console.log('Voice Command Debug - No assignments found in context');
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    console.log('Voice Command Debug - Normalized query:', normalizedQuery);
    
    // Try exact name match
    let assignment = context.assignments.find((a: any) => 
      a.name.toLowerCase() === normalizedQuery
    );
    
    if (assignment) {
      console.log('Voice Command Debug - Found exact assignment match:', assignment.name);
      return assignment;
    }

    // Try partial name match
    assignment = context.assignments.find((a: any) => 
      a.name.toLowerCase().includes(normalizedQuery)
    );
    
    if (assignment) {
      console.log('Voice Command Debug - Found partial assignment match:', assignment.name);
      return assignment;
    }

    // Try word-by-word matching
    const queryWords = normalizedQuery.split(/\s+/);
    assignment = context.assignments.find((a: any) => {
      const nameWords = a.name.toLowerCase().split(/\s+/);
      const allWordsFound = queryWords.every(queryWord => 
        nameWords.some(nameWord => nameWord.includes(queryWord))
      );
      
      if (allWordsFound) {
        console.log('Voice Command Debug - Found word-by-word assignment match:', a.name);
        return true;
      }
      
      return false;
    });

    if (!assignment) {
      console.log('Voice Command Debug - No assignment found for query:', query);
      console.log('Voice Command Debug - Available assignments:', context.assignments.map((a: any) => a.name));
    }

    return assignment;
  }, [context?.assignments]);

  // Helper function to find discussions by name
  const findDiscussionByQuery = useCallback((query: string) => {
    console.log('Voice Command Debug - findDiscussionByQuery called with:', query);
    console.log('Voice Command Debug - context.discussions:', context?.discussions);
    
    if (!context?.discussions || !Array.isArray(context.discussions)) {
      console.log('Voice Command Debug - No discussions found in context');
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    console.log('Voice Command Debug - Normalized query:', normalizedQuery);
    
    // Try exact title match
    let discussion = context.discussions.find((d: any) => 
      d.title.toLowerCase() === normalizedQuery
    );
    
    if (discussion) {
      console.log('Voice Command Debug - Found exact discussion match:', discussion.title);
      return discussion;
    }

    // Try partial title match
    discussion = context.discussions.find((d: any) => 
      d.title.toLowerCase().includes(normalizedQuery)
    );
    
    if (discussion) {
      console.log('Voice Command Debug - Found partial discussion match:', discussion.title);
      return discussion;
    }

    // Try word-by-word matching
    const queryWords = normalizedQuery.split(/\s+/);
    discussion = context.discussions.find((d: any) => {
      const titleWords = d.title.toLowerCase().split(/\s+/);
      const allWordsFound = queryWords.every(queryWord => 
        titleWords.some(titleWord => titleWord.includes(queryWord))
      );
      
      if (allWordsFound) {
        console.log('Voice Command Debug - Found word-by-word discussion match:', d.title);
        return true;
      }
      
      return false;
    });

    if (!discussion) {
      console.log('Voice Command Debug - No discussion found for query:', query);
      console.log('Voice Command Debug - Available discussions:', context.discussions.map((d: any) => d.title));
    }

    return discussion;
  }, [context?.discussions]);

  // Helper function to find quizzes by name
  const findQuizByQuery = useCallback((query: string) => {
    console.log('Voice Command Debug - findQuizByQuery called with:', query);
    console.log('Voice Command Debug - context.quizzes:', context?.quizzes);
    
    if (!context?.quizzes || !Array.isArray(context.quizzes)) {
      console.log('Voice Command Debug - No quizzes found in context');
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    console.log('Voice Command Debug - Normalized query:', normalizedQuery);
    
    // Try exact title match
    let quiz = context.quizzes.find((q: any) => 
      q.title.toLowerCase() === normalizedQuery
    );
    
    if (quiz) {
      console.log('Voice Command Debug - Found exact quiz match:', quiz.title);
      return quiz;
    }

    // Try partial title match
    quiz = context.quizzes.find((q: any) => 
      q.title.toLowerCase().includes(normalizedQuery)
    );
    
    if (quiz) {
      console.log('Voice Command Debug - Found partial quiz match:', quiz.title);
      return quiz;
    }

    // Try word-by-word matching
    const queryWords = normalizedQuery.split(/\s+/);
    quiz = context.quizzes.find((q: any) => {
      const titleWords = q.title.toLowerCase().split(/\s+/);
      const allWordsFound = queryWords.every(queryWord => 
        titleWords.some(titleWord => titleWord.includes(queryWord))
      );
      
      if (allWordsFound) {
        console.log('Voice Command Debug - Found word-by-word quiz match:', q.title);
        return true;
      }
      
      return false;
    });

    if (!quiz) {
      console.log('Voice Command Debug - No quiz found for query:', query);
      console.log('Voice Command Debug - Available quizzes:', context.quizzes.map((q: any) => q.title));
    }

    return quiz;
  }, [context?.quizzes]);

  // Voice commands registry
  const commands: VoiceCommand[] = [
    // Navigation commands
    {
      pattern: /^(open courses|show courses|go to courses)$/i,
      action: () => navigate('/courses'),
      description: 'Navigate to courses page'
    },
    {
      pattern: /^(dashboard|go to dashboard|show dashboard)$/i,
      action: () => navigate('/dashboard'),
      description: 'Navigate to dashboard'
    },
    {
      pattern: /^(assignments|show assignments|go to assignments)$/i,
      action: () => navigate('/assignments'),
      description: 'Navigate to assignments'
    },
    
    // Course-specific commands (only active on courses page)
    {
      pattern: /^(open course|view course|go to course) (.+)$/i,
      action: (matches) => {
        const courseName = matches[2];
        console.log('Voice Command Debug - Attempting to open course:', courseName);
        const course = findCourseByQuery(courseName);
        
        if (course) {
          console.log('Voice Command Debug - Successfully found course, navigating to:', `/courses/${course.id}`);
          navigate(`/courses/${course.id}`);
          toast({ title: `Opening ${course.name}` });
        } else {
          console.log('Voice Command Debug - Course not found, showing error');
          const availableCourses = context?.courses?.map((c: any) => c.name).slice(0, 5) || [];
          toast({ 
            title: 'Course Not Found', 
            description: `Could not find course matching "${courseName}". Available courses include: ${availableCourses.join(', ')}${availableCourses.length >= 5 ? '...' : ''}`,
            variant: 'destructive'
          });
        }
      },
      description: 'Open a specific course by name or code',
      context: ['courses']
    },
    {
      pattern: /^(open|view|go to) (.+) course$/i,
      action: (matches) => {
        const courseName = matches[2];
        console.log('Voice Command Debug - Attempting to open course (alt syntax):', courseName);
        const course = findCourseByQuery(courseName);
        
        if (course) {
          console.log('Voice Command Debug - Successfully found course, navigating to:', `/courses/${course.id}`);
          navigate(`/courses/${course.id}`);
          toast({ title: `Opening ${course.name}` });
        } else {
          console.log('Voice Command Debug - Course not found, showing error');
          const availableCourses = context?.courses?.map((c: any) => c.name).slice(0, 5) || [];
          toast({ 
            title: 'Course Not Found', 
            description: `Could not find course matching "${courseName}". Available courses include: ${availableCourses.join(', ')}${availableCourses.length >= 5 ? '...' : ''}`,
            variant: 'destructive'
          });
        }
      },
      description: 'Open a course using alternative syntax',
      context: ['courses']
    },
    
    // Course detail page commands
    {
      pattern: /^(show assignments|view assignments|assignments tab)$/i,
      action: () => {
        const assignmentsTab = document.querySelector('[data-value="assignments"]') as HTMLElement;
        if (assignmentsTab) {
          assignmentsTab.click();
          toast({ title: 'Switched to assignments tab' });
        }
      },
      description: 'Switch to assignments tab',
      context: ['course-detail']
    },
    {
      pattern: /^(show discussions|view discussions|discussions tab)$/i,
      action: () => {
        const discussionsTab = document.querySelector('[data-value="discussions"]') as HTMLElement;
        if (discussionsTab) {
          discussionsTab.click();
          toast({ title: 'Switched to discussions tab' });
        }
      },
      description: 'Switch to discussions tab',
      context: ['course-detail']
    },
    {
      pattern: /^(show quizzes|view quizzes|quizzes tab)$/i,
      action: () => {
        const quizzesTab = document.querySelector('[data-value="quizzes"]') as HTMLElement;
        if (quizzesTab) {
          quizzesTab.click();
          toast({ title: 'Switched to quizzes tab' });
        }
      },
      description: 'Switch to quizzes tab',
      context: ['course-detail']
    },
    {
      pattern: /^(grade assignment|grade) (.+)$/i,
      action: (matches) => {
        const assignmentName = matches[2];
        console.log('Voice Command Debug - Attempting to grade assignment:', assignmentName);
        const assignment = findAssignmentByQuery(assignmentName);
        
        if (assignment) {
          const courseId = location.pathname.split('/')[2];
          console.log('Voice Command Debug - Found assignment, navigating to grade:', `/courses/${courseId}/assignments/${assignment.id}/grade`);
          navigate(`/courses/${courseId}/assignments/${assignment.id}/grade`);
          toast({ title: `Grading ${assignment.name}` });
        } else {
          console.log('Voice Command Debug - Assignment not found, showing error');
          const availableAssignments = context?.assignments?.map((a: any) => a.name).slice(0, 5) || [];
          toast({ 
            title: 'Assignment Not Found', 
            description: `Could not find assignment matching "${assignmentName}". Available assignments include: ${availableAssignments.join(', ')}${availableAssignments.length >= 5 ? '...' : ''}`,
            variant: 'destructive'
          });
        }
      },
      description: 'Grade a specific assignment by name',
      context: ['course-detail']
    },
    {
      pattern: /^(grade discussion|discussion) (.+)$/i,
      action: (matches) => {
        const discussionName = matches[2];
        console.log('Voice Command Debug - Attempting to grade discussion:', discussionName);
        const discussion = findDiscussionByQuery(discussionName);
        
        if (discussion) {
          const courseId = location.pathname.split('/')[2];
          console.log('Voice Command Debug - Found discussion, navigating to grade:', `/courses/${courseId}/discussions/${discussion.id}/grade`);
          navigate(`/courses/${courseId}/discussions/${discussion.id}/grade`);
          toast({ title: `Grading ${discussion.title}` });
        } else {
          console.log('Voice Command Debug - Discussion not found, showing error');
          const availableDiscussions = context?.discussions?.map((d: any) => d.title).slice(0, 5) || [];
          toast({ 
            title: 'Discussion Not Found', 
            description: `Could not find discussion matching "${discussionName}". Available discussions include: ${availableDiscussions.join(', ')}${availableDiscussions.length >= 5 ? '...' : ''}`,
            variant: 'destructive'
          });
        }
      },
      description: 'Grade a specific discussion by name',
      context: ['course-detail']
    },
    {
      pattern: /^(grade quiz|quiz) (.+)$/i,
      action: (matches) => {
        const quizName = matches[2];
        console.log('Voice Command Debug - Attempting to grade quiz:', quizName);
        const quiz = findQuizByQuery(quizName);
        
        if (quiz) {
          const courseId = location.pathname.split('/')[2];
          console.log('Voice Command Debug - Found quiz, navigating to grade:', `/courses/${courseId}/quizzes/${quiz.id}/grade`);
          navigate(`/courses/${courseId}/quizzes/${quiz.id}/grade`);
          toast({ title: `Grading ${quiz.title}` });
        } else {
          console.log('Voice Command Debug - Quiz not found, showing error');
          const availableQuizzes = context?.quizzes?.map((q: any) => q.title).slice(0, 5) || [];
          toast({ 
            title: 'Quiz Not Found', 
            description: `Could not find quiz matching "${quizName}". Available quizzes include: ${availableQuizzes.join(', ')}${availableQuizzes.length >= 5 ? '...' : ''}`,
            variant: 'destructive'
          });
        }
      },
      description: 'Grade a specific quiz by name',
      context: ['course-detail']
    },
    
    // Grading commands (only active in grading context)
    {
      pattern: /^grade (\d+(?:\.\d+)?)$/i,
      action: (matches) => {
        if (context?.setGradeInput) {
          context.setGradeInput(matches[1]);
          toast({ title: `Grade set to ${matches[1]}` });
        }
      },
      description: 'Set grade to specified number',
      context: ['grading']
    },
    {
      pattern: /^score (\d+(?:\.\d+)?) out of (\d+)$/i,
      action: (matches) => {
        if (context?.setGradeInput) {
          context.setGradeInput(matches[1]);
          toast({ title: `Grade set to ${matches[1]} out of ${matches[2]}` });
        }
      },
      description: 'Set grade with context',
      context: ['grading']
    },
    {
      pattern: /^(switch to summative|summative assessment)$/i,
      action: () => {
        if (context?.setIsSummativeAssessment) {
          context.setIsSummativeAssessment(true);
          toast({ title: 'Switched to summative assessment' });
        }
      },
      description: 'Switch to summative assessment',
      context: ['grading']
    },
    {
      pattern: /^(switch to formative|formative assessment)$/i,
      action: () => {
        if (context?.setIsSummativeAssessment) {
          context.setIsSummativeAssessment(false);
          toast({ title: 'Switched to formative assessment' });
        }
      },
      description: 'Switch to formative assessment',
      context: ['grading']
    },
    {
      pattern: /^(use rubric|enable rubric|rubric grading)$/i,
      action: () => {
        if (context?.setUseRubricForAI) {
          context.setUseRubricForAI(true);
          toast({ title: 'Using rubric for AI grading' });
        }
      },
      description: 'Use rubric for grading',
      context: ['grading']
    },
    {
      pattern: /^(use description|disable rubric|description grading)$/i,
      action: () => {
        if (context?.setUseRubricForAI) {
          context.setUseRubricForAI(false);
          toast({ title: 'Using description for AI grading' });
        }
      },
      description: 'Use description for grading',
      context: ['grading']
    },
    {
      pattern: /^(enable custom instructions|add custom instructions)$/i,
      action: () => {
        if (context?.setUseCustomPrompt) {
          context.setUseCustomPrompt(true);
          toast({ title: 'Custom instructions enabled' });
        }
      },
      description: 'Enable custom grading instructions',
      context: ['grading']
    },
    {
      pattern: /^(disable custom instructions|remove custom instructions)$/i,
      action: () => {
        if (context?.setUseCustomPrompt) {
          context.setUseCustomPrompt(false);
          toast({ title: 'Custom instructions disabled' });
        }
      },
      description: 'Disable custom grading instructions',
      context: ['grading']
    },
    {
      pattern: /^(generate ai feedback|ai grade|get ai assistance)$/i,
      action: () => {
        if (context?.onAIGrading) {
          context.onAIGrading();
          toast({ title: 'Generating AI feedback...' });
        }
      },
      description: 'Generate AI-assisted feedback',
      context: ['grading']
    },
    {
      pattern: /^(save grade|submit grade)$/i,
      action: () => {
        if (context?.onSaveGrade) {
          context.onSaveGrade();
          toast({ title: 'Saving grade...' });
        }
      },
      description: 'Save grade to Canvas',
      context: ['grading']
    },
    {
      pattern: /^comment (.+)$/i,
      action: (matches) => {
        if (context?.setCommentInput) {
          const comment = matches[1];
          context.setCommentInput(comment);
          toast({ title: 'Comment added' });
        }
      },
      description: 'Add comment via voice',
      context: ['grading']
    },
    {
      pattern: /^(clear feedback|clear comment)$/i,
      action: () => {
        if (context?.setCommentInput) {
          context.setCommentInput('');
          toast({ title: 'Feedback cleared' });
        }
      },
      description: 'Clear feedback text',
      context: ['grading']
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setState(prev => ({ ...prev, transcript }));
        
        if (event.results[0].isFinal) {
          processCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false, 
          error: `Speech recognition error: ${event.error}` 
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isSupported: true }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: 'Speech recognition not supported in this browser' 
      }));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getCurrentContext = useCallback(() => {
    if (location.pathname.includes('/grade')) {
      return 'grading';
    }
    if (location.pathname === '/courses') {
      return 'courses';
    }
    if (location.pathname.match(/^\/courses\/\d+$/)) {
      return 'course-detail';
    }
    return 'general';
  }, [location.pathname]);

  const processCommand = useCallback((transcript: string) => {
    console.log('Processing voice command:', transcript);
    
    const currentContext = getCurrentContext();
    const availableCommands = commands.filter(cmd => 
      !cmd.context || cmd.context.includes(currentContext)
    );

    for (const command of availableCommands) {
      const matches = transcript.match(command.pattern);
      if (matches) {
        console.log('Command matched:', command.description);
        try {
          command.action(matches, context);
          return;
        } catch (error) {
          console.error('Error executing command:', error);
          toast({ 
            title: 'Command Error', 
            description: 'Failed to execute voice command',
            variant: 'destructive'
          });
          return;
        }
      }
    }

    // No command matched
    toast({ 
      title: 'Command Not Recognized', 
      description: `Could not understand: "${transcript}"`,
      variant: 'destructive'
    });
  }, [commands, context, getCurrentContext, toast, findCourseByQuery]);

  const startListening = useCallback(() => {
    if (!state.isSupported) {
      toast({ 
        title: 'Not Supported', 
        description: 'Voice recognition is not supported in this browser',
        variant: 'destructive'
      });
      return;
    }

    if (state.isListening) return;

    try {
      recognitionRef.current?.start();
      
      // Auto-stop after 5 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 5000);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start voice recognition' 
      }));
    }
  }, [state.isSupported, state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  const getAvailableCommands = useCallback(() => {
    const currentContext = getCurrentContext();
    return commands.filter(cmd => 
      !cmd.context || cmd.context.includes(currentContext)
    );
  }, [getCurrentContext]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    getAvailableCommands
  };
};
