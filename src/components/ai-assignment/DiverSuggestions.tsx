import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Copy, Eye, Users, CheckCircle, Edit, Brain, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AssignmentEditor from './AssignmentEditor';

interface DiverSuggestion {
  phase: string;
  title: string;
  description: string;
  activities: string[];
  examples: string[];
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
  };
}

const DiverSuggestions: React.FC<DiverSuggestionsProps> = ({ integration, originalAssignment }) => {
  const { toast } = useToast();
  const [selectedSuggestions, setSelectedSuggestions] = useState<DiverSuggestion[]>([]);
  const [revisedAssignment, setRevisedAssignment] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const phaseIcons = {
    'Discovery': Eye,
    'Interaction & Collaboration': Users,
    'Verification': CheckCircle,
    'Editing & Iteration': Edit,
    'Reflection': Brain
  };

  const phaseColors = {
    'Discovery': 'bg-blue-100 text-blue-800 border-blue-200',
    'Interaction & Collaboration': 'bg-green-100 text-green-800 border-green-200',
    'Verification': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Editing & Iteration': 'bg-purple-100 text-purple-800 border-purple-200',
    'Reflection': 'bg-red-100 text-red-800 border-red-200'
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">AI Integration Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-4">{integration.overview}</p>
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {originalAssignment && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">
              Select Suggestions to Integrate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 text-sm mb-4">
              Choose which DIVER suggestions you'd like to integrate into your assignment. 
              Selected suggestions will be used to create a revised assignment description.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span className="font-medium">Selected:</span>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {selectedSuggestions.length} of {integration.suggestions.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {integration.suggestions.map((suggestion, index) => {
        const IconComponent = phaseIcons[suggestion.phase as keyof typeof phaseIcons] || Eye;
        const colorClass = phaseColors[suggestion.phase as keyof typeof phaseColors] || phaseColors['Discovery'];
        const isSelected = selectedSuggestions.some(s => s.phase === suggestion.phase);
        
        return (
          <Card 
            key={index} 
            className={`border-l-4 border-l-indigo-500 transition-all duration-200 ${
              isSelected ? 'ring-2 ring-indigo-200 bg-indigo-50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {originalAssignment && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSuggestionToggle(suggestion, checked as boolean)}
                      className="mr-3"
                    />
                  )}
                  <IconComponent className="w-6 h-6 text-indigo-600 mr-3" />
                  <div>
                    <Badge className={`mb-2 ${colorClass}`}>
                      {suggestion.phase}
                    </Badge>
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  </div>
                </div>
                <Button 
                  onClick={() => handleCopySuggestion(suggestion)} 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{suggestion.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Activities</h4>
                  <ul className="space-y-1">
                    {suggestion.activities.map((activity, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Examples</h4>
                  <ul className="space-y-1">
                    {suggestion.examples.map((example, idx) => (
                      <li key={idx} className="text-sm text-gray-600 italic flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {originalAssignment && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Ready to Create Your Revised Assignment?
                </h3>
                <p className="text-purple-800 text-sm">
                  Generate a new assignment description that integrates your selected AI literacy suggestions.
                </p>
              </div>
              <Button 
                onClick={generateRevisedAssignment}
                disabled={selectedSuggestions.length === 0 || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Generating...' : 'Create Revised Assignment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {revisedAssignment && (
        <AssignmentEditor
          revisedAssignment={revisedAssignment}
          onRegenerate={generateRevisedAssignment}
          loading={loading}
        />
      )}

      <Card className="bg-gray-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Implementation Guide</CardTitle>
            <Button 
              onClick={handleCopyImplementationGuide} 
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-gray-700">{integration.implementation_guide}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiverSuggestions;
