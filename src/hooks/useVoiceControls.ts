
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
    if (!context?.courses || !Array.isArray(context.courses)) {
      return null;
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    // First try exact matches
    let course = context.courses.find((c: any) => 
      c.name.toLowerCase().includes(normalizedQuery) ||
      c.course_code.toLowerCase().includes(normalizedQuery)
    );

    // If no exact match, try partial matches
    if (!course) {
      course = context.courses.find((c: any) => {
        const nameWords = c.name.toLowerCase().split(/\s+/);
        const codeWords = c.course_code.toLowerCase().split(/\s+/);
        
        return nameWords.some((word: string) => word.includes(normalizedQuery)) ||
               codeWords.some((word: string) => word.includes(normalizedQuery));
      });
    }

    return course;
  }, [context?.courses]);

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
        const course = findCourseByQuery(courseName);
        
        if (course) {
          navigate(`/courses/${course.id}`);
          toast({ title: `Opening ${course.name}` });
        } else {
          toast({ 
            title: 'Course Not Found', 
            description: `Could not find course matching "${courseName}"`,
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
        const course = findCourseByQuery(courseName);
        
        if (course) {
          navigate(`/courses/${course.id}`);
          toast({ title: `Opening ${course.name}` });
        } else {
          toast({ 
            title: 'Course Not Found', 
            description: `Could not find course matching "${courseName}"`,
            variant: 'destructive'
          });
        }
      },
      description: 'Open a course using alternative syntax',
      context: ['courses']
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
