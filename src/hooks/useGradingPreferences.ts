import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GradingPreference {
  id: string;
  name: string;
  prompt_text: string;
  category: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useGradingPreferences = () => {
  const [preferences, setPreferences] = useState<GradingPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  const fetchPreferences = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_grading_preferences')
        .select('*')
        .order('is_default', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching grading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load saved grading preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreference = async (name: string, promptText: string, category: string = 'general', isDefault: boolean = false) => {
    if (!session?.user?.id || !name.trim() || !promptText.trim()) return false;

    try {
      // If setting as default, first remove default from all other preferences
      if (isDefault) {
        await supabase
          .from('user_grading_preferences')
          .update({ is_default: false })
          .eq('user_id', session.user.id);
      }

      const { data, error } = await supabase
        .from('user_grading_preferences')
        .insert({
          user_id: session.user.id,
          name: name.trim(),
          prompt_text: promptText.trim(),
          category,
          is_default: isDefault
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPreferences(prev => [data, ...prev.filter(p => !isDefault || !p.is_default)]);
      
      toast({
        title: "Success",
        description: `Grading preference "${name}" saved successfully`,
      });

      return true;
    } catch (error) {
      console.error('Error saving grading preference:', error);
      toast({
        title: "Error",
        description: "Failed to save grading preference",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePreference = async (id: string, updates: Partial<GradingPreference>) => {
    if (!session?.user?.id) return false;

    try {
      // If setting as default, first remove default from all other preferences
      if (updates.is_default) {
        await supabase
          .from('user_grading_preferences')
          .update({ is_default: false })
          .eq('user_id', session.user.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('user_grading_preferences')
        .update(updates)
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPreferences(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : 
        updates.is_default ? { ...p, is_default: false } : p
      ));

      toast({
        title: "Success",
        description: "Grading preference updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating grading preference:', error);
      toast({
        title: "Error",
        description: "Failed to update grading preference",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePreference = async (id: string) => {
    if (!session?.user?.id) return false;

    try {
      const { error } = await supabase
        .from('user_grading_preferences')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      setPreferences(prev => prev.filter(p => p.id !== id));

      toast({
        title: "Success",
        description: "Grading preference deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting grading preference:', error);
      toast({
        title: "Error",
        description: "Failed to delete grading preference",
        variant: "destructive",
      });
      return false;
    }
  };

  const getDefaultPreference = () => {
    return preferences.find(p => p.is_default);
  };

  useEffect(() => {
    fetchPreferences();
  }, [session?.user?.id]);

  return {
    preferences,
    loading,
    savePreference,
    updatePreference,
    deletePreference,
    getDefaultPreference,
    refetch: fetchPreferences
  };
};