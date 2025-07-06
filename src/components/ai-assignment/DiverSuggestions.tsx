import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AssignmentComparison from './AssignmentComparison';
import IntegrationOverview from './suggestions/IntegrationOverview';
import SuggestionsSelection from './suggestions/SuggestionsSelection';
import DiverSuggestionCard from './suggestions/DiverSuggestionCard';
import RevisionActions from './suggestions/RevisionActions';
import ImplementationGuide from './suggestions/ImplementationGuide';

interface DiverSuggestion {
  phase: string;
  title: string;
  description: string;
  activities: string[];
  examples: string[];
  studentAIPrompts: string[];
  teachingTips: string[];
  criticalThinkingQuestions: string[];
  responsibleUseGuideline: string;
}

interface DiverSuggestionsProps {
  integration: {
    overview: string;
    suggestions: DiverSuggestion[];
    implementation_guide: string;
  };
  originalAssignment?: {
    title: string;
    content: string;
    subject?: string;
    gradeLevel?: string;
    estimatedTime?: string;
    courseId?: string;
    assignmentId?: string;
  };
}

const DiverSuggestions: React.FC<DiverSuggestionsProps> = ({ integration, originalAssignment }) => {
  const { toast } = useToast();
  const [selectedSuggestions, setSelectedSuggestions] = useState<DiverSuggestion[]>([]);
  const [revisedAssignment, setRevisedAssignment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [canvasUpdateLoading, setCanvasUpdateLoading] = useState(false);

  const handleSuggestionToggle = (suggestion: DiverSuggestion, checked: boolean) => {
    if (checked) {
      setSelectedSuggestions(prev => [...prev, suggestion]);
    } else {
      setSelectedSuggestions(prev => prev.filter(s => s.phase !== suggestion.phase));
    }
  };

  const generateRevisedAssignment = async () => {
    if (!originalAssignment || selectedSuggestions.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one suggestion to integrate.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-revised-assignment', {
        body: {
          originalAssignment: originalAssignment.content,
          selectedSuggestions,
          assignmentTitle: originalAssignment.title,
          subject: originalAssignment.subject,
          gradeLevel: originalAssignment.gradeLevel,
          estimatedTime: originalAssignment.estimatedTime
        }
      });

      if (error) throw error;

      setRevisedAssignment(data.revisedAssignment);
      toast({
        title: "Assignment Revised",
        description: "Your assignment has been successfully updated with the selected AI literacy suggestions.",
      });
    } catch (error) {
      console.error('Error generating revised assignment:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate revised assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const content = `
AI Literacy Integration Suggestions
${integration.overview}

${integration.suggestions.map(suggestion => `
${suggestion.phase}: ${suggestion.title}
${suggestion.description}

Activities:
${suggestion.activities.map(activity => `• ${activity}`).join('\n')}

Examples:
${suggestion.examples.map(example => `• ${example}`).join('\n')}
`).join('\n')}

Implementation Guide:
${integration.implementation_guide}
    `;
    
    navigator.clipboard.writeText(content);
    toast({
      title: "Content Copied",
      description: "All AI integration suggestions have been copied to your clipboard.",
    });
  };

  const handleCopySuggestion = (suggestion: DiverSuggestion) => {
    const content = `
${suggestion.phase}: ${suggestion.title}
${suggestion.description}

Activities:
${suggestion.activities.map(activity => `• ${activity}`).join('\n')}

Examples:
${suggestion.examples.map(example => `• ${example}`).join('\n')}
    `;
    
    navigator.clipboard.writeText(content.trim());
    toast({
      title: "Phase Content Copied",
      description: `${suggestion.phase} phase content has been copied to your clipboard.`,
    });
  };

  const handleCopyImplementationGuide = () => {
    const content = `Implementation Guide:\n${integration.implementation_guide}`;
    
    navigator.clipboard.writeText(content);
    toast({
      title: "Implementation Guide Copied",
      description: "The implementation guide has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    const content = `
AI Literacy Integration Suggestions
${integration.overview}

${integration.suggestions.map(suggestion => `
${suggestion.phase}: ${suggestion.title}
${suggestion.description}

Activities:
${suggestion.activities.map(activity => `• ${activity}`).join('\n')}

Examples:
${suggestion.examples.map(example => `• ${example}`).join('\n')}
`).join('\n')}

Implementation Guide:
${integration.implementation_guide}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-literacy-integration.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateCanvasAssignment = async () => {
    if (!originalAssignment?.courseId || !originalAssignment?.assignmentId || !revisedAssignment) {
      toast({
        title: "Missing Information",
        description: "Cannot update Canvas assignment. Missing course ID, assignment ID, or revised assignment content.",
        variant: "destructive"
      });
      return;
    }

    setCanvasUpdateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-canvas-assignment', {
        body: {
          courseId: originalAssignment.courseId,
          assignmentId: originalAssignment.assignmentId,
          updatedContent: revisedAssignment,
          preserveFormatting: false
        }
      });

      if (error) throw error;

      toast({
        title: "Canvas Assignment Updated",
        description: "Your assignment has been successfully updated in Canvas with the AI literacy integration.",
      });
    } catch (error) {
      console.error('Error updating Canvas assignment:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update assignment in Canvas. Please try again or copy the content manually.",
        variant: "destructive"
      });
    } finally {
      setCanvasUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <IntegrationOverview
        overview={integration.overview}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />

      {originalAssignment && (
        <SuggestionsSelection
          selectedCount={selectedSuggestions.length}
          totalCount={integration.suggestions.length}
        >
          {integration.suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestions.some(s => s.phase === suggestion.phase);
            
            return (
              <DiverSuggestionCard
                key={index}
                suggestion={suggestion}
                isSelected={isSelected}
                onToggle={(checked) => handleSuggestionToggle(suggestion, checked)}
                onCopy={() => handleCopySuggestion(suggestion)}
                showSelection={true}
              />
            );
          })}
        </SuggestionsSelection>
      )}

      {!originalAssignment && (
        <div className="space-y-4">
          {integration.suggestions.map((suggestion, index) => (
            <DiverSuggestionCard
              key={index}
              suggestion={suggestion}
              isSelected={false}
              onToggle={() => {}}
              onCopy={() => handleCopySuggestion(suggestion)}
              showSelection={false}
            />
          ))}
        </div>
      )}

      {originalAssignment && (
        <RevisionActions
          selectedCount={selectedSuggestions.length}
          onGenerateRevision={generateRevisedAssignment}
          revisionLoading={loading}
          showCanvasUpdate={!!revisedAssignment && !!originalAssignment?.courseId && !!originalAssignment?.assignmentId}
          onCanvasUpdate={updateCanvasAssignment}
          canvasUpdateLoading={canvasUpdateLoading}
          assignmentTitle={originalAssignment.title}
          assignmentSubject={originalAssignment.subject}
        />
      )}

      {revisedAssignment && originalAssignment && (
        <AssignmentComparison
          originalAssignment={{
            title: originalAssignment.title,
            content: originalAssignment.content
          }}
          revisedAssignment={revisedAssignment}
          onRevisedAssignmentChange={setRevisedAssignment}
          onRegenerate={generateRevisedAssignment}
          loading={loading}
        />
      )}

      <ImplementationGuide
        implementationGuide={integration.implementation_guide}
        onCopy={handleCopyImplementationGuide}
      />
    </div>
  );
};

export default DiverSuggestions;