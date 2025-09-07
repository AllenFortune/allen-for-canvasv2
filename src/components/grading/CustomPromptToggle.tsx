
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, Trash2, Star } from 'lucide-react';
import { useGradingPreferences } from '@/hooks/useGradingPreferences';

interface CustomPromptToggleProps {
  useCustomPrompt: boolean;
  setUseCustomPrompt: (value: boolean) => void;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  category?: string;
}

const CustomPromptToggle: React.FC<CustomPromptToggleProps> = ({
  useCustomPrompt,
  setUseCustomPrompt,
  customPrompt,
  setCustomPrompt,
  category = 'general'
}) => {
  const { preferences, loading, savePreference, deletePreference, updatePreference, getDefaultPreference } = useGradingPreferences();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string>('');

  // Load default preference on mount
  useEffect(() => {
    const defaultPref = getDefaultPreference();
    if (defaultPref && !customPrompt && !useCustomPrompt) {
      setCustomPrompt(defaultPref.prompt_text);
      setUseCustomPrompt(true);
    }
  }, [preferences, customPrompt, useCustomPrompt, setCustomPrompt, setUseCustomPrompt, getDefaultPreference]);

  const handleLoadPreference = (preferenceId: string) => {
    const preference = preferences.find(p => p.id === preferenceId);
    if (preference) {
      setCustomPrompt(preference.prompt_text);
      setUseCustomPrompt(true);
      setSelectedPreferenceId(preferenceId);
    }
  };

  const handleSavePreference = async () => {
    if (!saveName.trim() || !customPrompt.trim()) return;
    
    const success = await savePreference(saveName, customPrompt, category);
    if (success) {
      setSaveName('');
      setShowSaveDialog(false);
    }
  };

  const handleDeletePreference = async (preferenceId: string) => {
    await deletePreference(preferenceId);
    if (selectedPreferenceId === preferenceId) {
      setSelectedPreferenceId('');
    }
  };

  const handleSetAsDefault = async (preferenceId: string) => {
    await updatePreference(preferenceId, { is_default: true });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Custom Grading Instructions
          </label>
          <Switch
            checked={useCustomPrompt}
            onCheckedChange={setUseCustomPrompt}
          />
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Add specific focus areas or grading preferences for AI
        </p>
      </div>
      
      {useCustomPrompt && (
        <div className="space-y-3">
          {/* Saved Preferences Dropdown */}
          {preferences.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Load Saved Preference:</label>
              <div className="flex gap-2">
                <Select
                  value={selectedPreferenceId}
                  onValueChange={handleLoadPreference}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a saved preference..." />
                  </SelectTrigger>
                  <SelectContent>
                    {preferences.map((preference) => (
                      <SelectItem key={preference.id} value={preference.id}>
                        <div className="flex items-center gap-2">
                          {preference.is_default && <Star className="w-3 h-3 fill-current" />}
                          <span>{preference.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPreferenceId && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetAsDefault(selectedPreferenceId)}
                      title="Set as default"
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePreference(selectedPreferenceId)}
                      title="Delete preference"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Prompt Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">Instructions:</label>
              {customPrompt.trim() && (
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Save Grading Preference</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="e.g., Essay Grading - Focus on Citations"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSavePreference}
                          disabled={!saveName.trim() || loading}
                        >
                          Save Preference
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowSaveDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <Textarea
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                // Clear selected preference when manually editing
                if (selectedPreferenceId && e.target.value !== preferences.find(p => p.id === selectedPreferenceId)?.prompt_text) {
                  setSelectedPreferenceId('');
                }
              }}
              placeholder="e.g., Focus heavily on proper citation format and critical thinking. Be more lenient on grammar errors for ESL students..."
              rows={3}
              className="text-sm"
            />
            <p className="text-xs text-gray-400">
              These instructions will be added to the AI grading prompt
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomPromptToggle;
