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
        const fileName = attachment.filename || attachment.display_name;
        console.log('Processing attachment:', fileName);
        console.log('Attachment URL:', attachment.url);
        console.log('Attachment type:', attachment['content-type']);
        
        try {
          const { data, error } = await supabase.functions.invoke('process-document-content', {
            body: {
              fileUrl: attachment.url,
              fileName: fileName,
              mimeType: attachment['content-type'] || ''
            }
          });

          if (error) {
            console.error('Supabase function error:', error);
            combinedContent += `\n[File: ${fileName} - Processing failed: ${error.message}]`;
          } else if (data?.success && data?.extractedText) {
            console.log('Successfully processed file:', fileName);
            console.log('Extracted text length:', data.extractedText.length);
            combinedContent += `\n\n--- Content from ${fileName} ---\n${data.extractedText}`;
          } else {
            console.error('No data returned or processing failed:', data);
            combinedContent += `\n[File: ${fileName} - No content could be extracted]`;
          }
        } catch (fileError) {
          console.error('Error processing individual file:', fileError);
          combinedContent += `\n[File: ${fileName} - Processing error: ${fileError.message}]`;
        }
      }
    } catch (error) {
      console.error('Error in file processing loop:', error);
      toast({
        title: "File Processing Error",
        description: "Some files couldn't be processed. AI will grade based on available content.",
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
      console.log('Added body content, length:', submission.body.length);
    }

    // Add URL submission context if available
    if (submission.url) {
      content += `\n\nWebsite submission: ${submission.url}`;
      console.log('Added URL submission');
    }

    // Process file attachments
    const fileContent = await processSubmissionFiles(submission);
    if (fileContent) {
      content += fileContent;
      console.log('Added file content, total length now:', content.length);
    }

    // If no content found, provide context
    if (!content.trim()) {
      content = 'No text content or processable files found in submission. Student may have submitted unsupported file types or empty content.';
      console.log('No content found, using fallback message');
    }

    console.log('Final submission content length:', content.length);
    console.log('Content preview:', content.substring(0, 300));

    return content;
  };

  const generateComprehensiveFeedback = async (
    submission: Submission,
    assignment: Assignment | null,
    currentGrade?: string,
    useRubric: boolean = false,
    isSummativeAssessment: boolean = true,
    customPrompt?: string
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
          useRubric: useRubric && assignment.rubric,
          isSummativeAssessment,
          customPrompt: customPrompt || null
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
        const assessmentType = isSummativeAssessment ? 'summative' : 'formative';
        const hasFiles = submission.attachments && submission.attachments.length > 0;
        const hasCustom = customPrompt && customPrompt.trim().length > 0;
        
        toast({
          title: "Success",
          description: `AI ${assessmentType} grading generated using ${feedbackType}!${hasFiles ? ' File content processed.' : ''}${hasCustom ? ' Custom instructions applied.' : ''}`,
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
