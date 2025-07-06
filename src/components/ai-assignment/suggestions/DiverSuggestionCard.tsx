import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Eye, Users, CheckCircle, Edit, Brain, ChevronDown, ChevronRight, Lightbulb, MessageSquare, HelpCircle, Shield } from 'lucide-react';

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

interface DiverSuggestionCardProps {
  suggestion: DiverSuggestion;
  isSelected: boolean;
  onToggle: (checked: boolean) => void;
  onCopy: () => void;
  showSelection?: boolean;
}

const DiverSuggestionCard: React.FC<DiverSuggestionCardProps> = ({
  suggestion,
  isSelected,
  onToggle,
  onCopy,
  showSelection = false
}) => {
  const [showStudentPrompts, setShowStudentPrompts] = React.useState(false);
  const [showTeachingTips, setShowTeachingTips] = React.useState(false);
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

  const IconComponent = phaseIcons[suggestion.phase as keyof typeof phaseIcons] || Eye;
  const colorClass = phaseColors[suggestion.phase as keyof typeof phaseColors] || phaseColors['Discovery'];

  return (
    <Card 
      className={`border-l-4 border-l-indigo-500 transition-all duration-200 ${
        isSelected ? 'ring-2 ring-indigo-200 bg-indigo-50' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggle}
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
            onClick={onCopy} 
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
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
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

        {/* Responsible Use Guideline */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <Shield className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">{suggestion.responsibleUseGuideline}</p>
          </div>
        </div>

        {/* Student AI Prompts */}
        <Collapsible open={showStudentPrompts} onOpenChange={setShowStudentPrompts}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mb-3">
              <MessageSquare className="w-4 h-4 mr-2" />
              Student AI Prompt Examples
              {showStudentPrompts ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-3">
                {suggestion.studentAIPrompts.map((prompt, idx) => (
                  <div key={idx} className="bg-white rounded p-3 border border-blue-100">
                    <p className="text-sm text-gray-700 mb-2">"{prompt}"</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(prompt);
                        // You could add a toast here if needed
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Prompt
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Critical Thinking Questions */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ask Yourself:
                </h5>
                <ul className="space-y-1">
                  {suggestion.criticalThinkingQuestions.map((question, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {question}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Teaching Tips */}
        <Collapsible open={showTeachingTips} onOpenChange={setShowTeachingTips}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Lightbulb className="w-4 h-4 mr-2" />
              Teaching Tips
              {showTeachingTips ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="space-y-2">
                {suggestion.teachingTips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-green-800 flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default DiverSuggestionCard;