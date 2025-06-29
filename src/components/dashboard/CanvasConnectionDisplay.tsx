
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
}

interface CanvasUser {
  id: number;
  name: string;
  email: string;
}

interface CanvasConnectionDisplayProps {
  profile: UserProfile | null;
  canvasUser: CanvasUser | null;
}

const CanvasConnectionDisplay = ({ profile, canvasUser }: CanvasConnectionDisplayProps) => {
  const isCanvasConnected = profile?.canvas_instance_url && profile?.canvas_access_token;

  if (!isCanvasConnected) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <p className="text-green-800 font-medium">
              Connected to Canvas: {profile.canvas_instance_url}
            </p>
            {canvasUser ? (
              <p className="text-green-600 text-sm">
                Logged in as: <strong>{canvasUser.name}</strong> ({canvasUser.email})
              </p>
            ) : (
              <p className="text-green-600 text-sm">Logged in as: Canvas User</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasConnectionDisplay;
