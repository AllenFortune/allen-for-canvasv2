
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface CustomPromptToggleProps {
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
}

const CustomPromptToggle: React.FC<CustomPromptToggleProps> = ({
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Custom Grading Instructions
          </label>
          <p className="text-xs text-gray-500">
            Add specific focus areas or grading preferences for AI
          </p>
        </div>
        <Switch
          checked={useCustomPrompt}
          onCheckedChange={setUseCustomPrompt}
        />
      </div>
      
      {useCustomPrompt && (
        <div className="space-y-2">
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., Focus heavily on proper citation format and critical thinking. Be more lenient on grammar errors for ESL students..."
            rows={3}
            className="text-sm"
          />
          <p className="text-xs text-gray-400">
            These instructions will be added to the AI grading prompt
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomPromptToggle;
