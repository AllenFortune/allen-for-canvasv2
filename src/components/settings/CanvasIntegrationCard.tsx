
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
  email?: string;
  full_name?: string;
}

interface CanvasIntegrationCardProps {
  profile: UserProfile | null;
}

const CanvasIntegrationCard: React.FC<CanvasIntegrationCardProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SettingsIcon className="w-5 h-5 mr-2" />
          Canvas Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {profile?.canvas_instance_url ? (
            <div>
              <label className="text-sm font-medium text-gray-700">Connected Canvas Instance</label>
              <p className="text-gray-900">{profile.canvas_instance_url}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">No Canvas instance connected</p>
            </div>
          )}
          <Link to="/canvas-setup">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              {profile?.canvas_instance_url ? 'Update' : 'Setup'} Canvas Integration
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanvasIntegrationCard;
