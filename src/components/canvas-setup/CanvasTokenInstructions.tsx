
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface CanvasTokenInstructionsProps {
  canvasUrl: string;
}

const CanvasTokenInstructions = ({ canvasUrl }: CanvasTokenInstructionsProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">How to generate a Canvas API token:</h3>
      <ol className="text-sm text-gray-600 space-y-2">
        <li>1. Log in to your Canvas account</li>
        <li>2. Click on your profile picture in the top right corner</li>
        <li>3. Select "Settings" from the dropdown menu</li>
        <li>4. Scroll down to the "Approved Integrations" section</li>
        <li>5. Click the "+ New Access Token" button</li>
        <li>6. Enter <strong>A.L.L.E.N. Grading Assistant</strong> as the Purpose</li>
        <li>7. Optionally set an expiration date (we recommend at least 1 year)</li>
        <li>8. Click "Generate Token"</li>
        <li>9. Copy the generated token and paste it in the field above</li>
      </ol>
      
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => window.open(`${canvasUrl}/profile/settings`, '_blank')}
        disabled={!canvasUrl}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Open Canvas Settings
      </Button>
    </div>
  );
};

export default CanvasTokenInstructions;
