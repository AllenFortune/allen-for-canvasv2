import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SuggestionsSelectionProps {
  selectedCount: number;
  totalCount: number;
  children: React.ReactNode;
  selectedPromptIds?: Record<string, number[]>;
}

const SuggestionsSelection: React.FC<SuggestionsSelectionProps> = ({
  selectedCount,
  totalCount,
  children,
  selectedPromptIds = {}
}) => {
  return (
    <>
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
              {selectedCount} phases
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {Object.values(selectedPromptIds || {}).reduce((total, prompts) => total + prompts.length, 0)} prompts
            </Badge>
          </div>
        </CardContent>
      </Card>
      {children}
    </>
  );
};

export default SuggestionsSelection;