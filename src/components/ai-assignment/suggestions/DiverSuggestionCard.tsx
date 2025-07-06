import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Eye, Users, CheckCircle, Edit, Brain } from 'lucide-react';

interface DiverSuggestion {
  phase: string;
  title: string;
  description: string;
  activities: string[];
  examples: string[];
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
};

export default DiverSuggestionCard;