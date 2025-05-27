
import React from 'react';
import { CheckCircle, User } from 'lucide-react';

interface CanvasUser {
  id: number;
  name: string;
  email: string;
}

interface CanvasConnectionStatusProps {
  connectionStatus: {
    connected: boolean;
    user?: CanvasUser;
  };
  canvasUrl: string;
}

const CanvasConnectionStatus = ({ connectionStatus, canvasUrl }: CanvasConnectionStatusProps) => {
  if (!connectionStatus.connected || !connectionStatus.user) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <h4 className="text-sm font-medium text-green-800">Connected to Canvas</h4>
          <div className="flex items-center space-x-2 mt-1">
            <User className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              Logged in as: <strong>{connectionStatus.user.name}</strong>
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">{canvasUrl}</p>
        </div>
      </div>
    </div>
  );
};

export default CanvasConnectionStatus;
