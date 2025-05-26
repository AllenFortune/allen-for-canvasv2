
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Assignment, Submission } from '@/types/grading';
import { useToast } from '@/hooks/use-toast';

export interface AIGradingResponse {
  grade: number | null;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  summary: string;
}

export const useAIFeedback = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const { toast } = useToast();

  const processSubmissionFiles = async (submission: Submission): Promise<string> => {
    if (!submission.attachments || submission.attachments.length === 0) {
      return '';
    }

    setIsProcessingFiles(true);
    let combinedContent = '';

    try {
      for (const attachment of submission.attachments) {
        console.log('Processing attachment:', attachment.filename || attachment.display_name);
        
        const { data, error } = await supabase.functions.invoke('process-document-content', {
          body: {
            fileUrl: attachment.url,
            fileName: attachment.filename || attachment.display_name,
            mimeType: attachment['content-type'] || ''
          }
        });

        if (error) {
          console.error('Error processing file:', error);
          combinedContent += `\n[File: ${attachment.filename || attachment.display_name} - Processing failed]`;
        } else if (data?.extractedText) {
          combinedContent += `\n\n--- Content from ${attachment.filename || attachment.display_name} ---\n${data.extractedText}`;
        }
      }
    } catch (error) {
      console.error('Error in file processing:', error);
      toast({
        title: "File Processing Warning",
        description: "Some files couldn't be processed automatically. AI will grade based on available content.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFiles(false);
    }

    return combinedContent;
  };

  const getSubmissionContent = async (submission: Submission): Promise<string> => {
    let content = '';

    // Start with text submission if available
    if (submission.body) {
      content += submission.body;
    }

    // Add URL submission context if available
    if (submission.url) {
      content += `\n\nWebsite submission: ${submission.url}`;
    }

    // Process file attachments
    const fileContent = await processSubmissionFiles(submission);
    content += fileContent;

    // If no content found, provide context
    if (!content.trim()) {
      content = 'No text content or processable files found in submission.';
    }

    return content;
  };

  const generateComprehensiveFeedback = async (
    submission: Submission,
    assignment: Assignment | null,
    currentGrade?: string,
    useRubric: boolean = false
  ): Promise<AIGradingResponse | null> => {
    if (!submission || !assignment) {
      toast({
        title: "Error",
        description: "Missing submission or assignment data",
        variant: "destructive",
      });
      return null;
    }

    setIsGenerating(true);

    try {
      console.log('Generating comprehensive AI grading for submission:', submission.id);

      // Get submission content including processed files
      const submissionContent = await getSubmissionContent(submission);
      console.log('Final submission content length:', submissionContent.length);

      const { data, error } = await supabase.functions.invoke('generate-ai-feedback', {
        body: {
          submissionContent,
          assignmentName: assignment.name,
          assignmentDescription: assignment.description,
          pointsPossible: assignment.points_possible,
          currentGrade: currentGrade || null,
          rubric: assignment.rubric ? JSON.stringify(assignment.rubric) : null,
          useRubric: useRubric && assignment.rubric
        }
      });

      if (error) {
        console.error('Error generating AI grading:', error);
        toast({
          title: "Error",
          description: "Failed to generate AI grading. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data && (data.feedback || data.grade !== undefined)) {
        const feedbackType = useRubric && assignment.rubric ? 'rubric criteria' : 'assignment description';
        const hasFiles = submission.attachments && submission.attachments.length > 0;
        
        toast({
          title: "Success",
          description: `AI grading generated using ${feedbackType}!${hasFiles ? ' File content processed.' : ''}`,
        });
        return {
          grade: data.grade,
          feedback: data.feedback || '',
          strengths: data.strengths || [],
          areasForImprovement: data.areasForImprovement || [],
          summary: data.summary || ''
        };
      } else {
        throw new Error('No grading data received from AI');
      }
    } catch (error) {
      console.error('Error generating AI grading:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating grading.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateComprehensiveFeedback,
    isGenerating,
    isProcessingFiles
  };
};
