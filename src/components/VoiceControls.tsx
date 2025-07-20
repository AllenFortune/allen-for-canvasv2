
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mic, MicOff, HelpCircle, Volume2 } from 'lucide-react';
import { useVoiceControls } from '@/hooks/useVoiceControls';

interface VoiceControlsProps {
  context?: any;
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({ context, className = '' }) => {
  const [showHelp, setShowHelp] = useState(false);
  const {
    isListening,
    isSupported,
    transcript,
    error,
    toggleListening,
    getAvailableCommands
  } = useVoiceControls(context);

  if (!isSupported) {
    return null;
  }

  const availableCommands = getAvailableCommands();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Voice activation button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={toggleListening}
        className={`relative ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
        disabled={!!error}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Listening...
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </>
        )}
      </Button>

      {/* Help dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <HelpCircle className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Commands Help
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Click the voice button and speak clearly. Commands will be processed automatically.
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Available Commands:</h4>
              <div className="grid gap-2">
                {availableCommands.map((command, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="font-mono text-sm">
                      {command.pattern.source
                        .replace(/\^\(/g, '')
                        .replace(/\)\$/g, '')
                        .replace(/\|/g, ' OR ')
                        .replace(/\(\.\+\)/g, '[text]')
                        .replace(/\(\\d\+\(\?\:\\\.\\d\+\)\?\)/g, '[number]')
                        .replace(/i$/g, '')
                      }
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {command.description}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {isListening && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Mic className="w-4 h-4 animate-pulse" />
                    <span className="font-medium">Listening...</span>
                  </div>
                  {transcript && (
                    <div className="mt-2 text-sm text-blue-600">
                      "{transcript}"
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4">
                  <div className="text-red-800 text-sm">{error}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status indicator */}
      {transcript && !isListening && (
        <Badge variant="outline" className="text-xs max-w-32 truncate">
          "{transcript}"
        </Badge>
      )}
    </div>
  );
};

export default VoiceControls;
