
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Edit2, Save, X } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  canvas_instance_url?: string;
  canvas_access_token?: string;
  school_name?: string;
  email?: string;
  full_name?: string;
}

interface ProfileCardProps {
  loading: boolean;
  profile: UserProfile | null;
  user: SupabaseUser | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ loading, profile, user, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    school_name: profile?.school_name || '',
  });
  const { toast } = useToast();

  const handleEdit = () => {
    setFormData({
      full_name: profile?.full_name || '',
      school_name: profile?.school_name || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      school_name: profile?.school_name || '',
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim() || null,
          school_name: formData.school_name.trim() || null,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedProfile = { ...profile, ...data };
      onProfileUpdate?.(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </div>
          {!loading && !isEditing && (
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">School/Institution</Label>
              <Input
                id="school_name"
                value={formData.school_name}
                onChange={(e) => handleInputChange('school_name', e.target.value)}
                placeholder="Enter your school or institution name"
              />
              <p className="text-sm text-muted-foreground">
                Help us understand which institutions are using Allen. This helps us provide better support and explore institutional plans.
              </p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving} size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <p className="text-foreground mt-1">{profile?.full_name || user?.email || 'Not set'}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-foreground mt-1">{user?.email}</p>
            </div>
            <div>
              <Label>School/Institution</Label>
              <p className="text-foreground mt-1">{profile?.school_name || 'Not set'}</p>
              {!profile?.school_name && (
                <p className="text-sm text-muted-foreground mt-1">
                  Consider adding your institution to help us understand our user base and explore institutional plans.
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
