
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X } from 'lucide-react';
import { useVoiceControls } from '@/hooks/useVoiceControls';
import { useLocation } from 'react-router-dom';

interface FloatingVoiceControlsProps {
  context?: any;
}

const FloatingVoiceControls: React.FC<FloatingVoiceControlsProps> = ({ context }) => {
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();
  const {
    isListening,
    isSupported,
    transcript,
    toggleListening
  } = useVoiceControls(context);

  // Show on grading pages and course detail pages
  const shouldShow = (location.pathname.includes('/grade') || location.pathname.match(/^\/courses\/\d+$/)) && isSupported && isVisible;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Transcript display */}
      {transcript && isListening && (
        <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm max-w-xs">
          "{transcript}"
        </div>
      )}
      
      {/* Voice control button */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={toggleListening}
          className={`h-12 w-12 rounded-full shadow-lg transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
      
      {/* Status indicator */}
      {isListening && (
        <div className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded">
          Listening...
        </div>
      )}
    </div>
  );
};

export default FloatingVoiceControls;
