import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RubricData } from '@/types/rubric';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRubricLibrary = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveRubric = useCallback(async (rubric: RubricData): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return null;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .insert({
          user_id: user.id,
          title: rubric.title,
          description: rubric.description,
          rubric_type: rubric.rubricType,
          points_possible: rubric.pointsPossible,
          criteria: rubric.criteria as any,
          performance_levels: rubric.performanceLevels as any,
          source_content: rubric.sourceContent,
          source_type: rubric.sourceType || 'manual',
          source_assignment_id: rubric.sourceAssignmentId,
          course_id: rubric.courseId,
          diver_alignment: rubric.diverAlignment as any,
          ai_literacy_components: rubric.aiLiteracyComponents as any,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rubric saved to your library!"
      });

      return data.id;
    } catch (error) {
      console.error('Error saving rubric:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error", 
        description: `Failed to save rubric: ${errorMessage}`,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  const updateRubric = useCallback(async (rubricId: string, updates: Partial<RubricData>): Promise<boolean> => {
    if (!user) return false;

    try {
      // Map RubricData fields to database fields
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.rubricType) dbUpdates.rubric_type = updates.rubricType;
      if (updates.pointsPossible) dbUpdates.points_possible = updates.pointsPossible;
      if (updates.criteria) dbUpdates.criteria = updates.criteria;
      if (updates.performanceLevels) dbUpdates.performance_levels = updates.performanceLevels;
      if (updates.status) dbUpdates.status = updates.status;
      
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('rubrics')
        .update(dbUpdates)
        .eq('id', rubricId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rubric updated successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error updating rubric:', error);
      
      toast({
        title: "Error",
        description: "Failed to update rubric",
        variant: "destructive"
      });

      return false;
    }
  }, [user, toast]);

  const deleteRubric = useCallback(async (rubricId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('rubrics')
        .delete()
        .eq('id', rubricId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rubric deleted successfully!"
      });

      return true;
    } catch (error) {
      console.error('Error deleting rubric:', error);
      
      toast({
        title: "Error",
        description: "Failed to delete rubric",
        variant: "destructive"
      });

      return false;
    }
  }, [user, toast]);

  const loadRubrics = useCallback(async (): Promise<RubricData[]> => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Map database fields to RubricData interface
      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description || '',
        rubricType: row.rubric_type as 'analytic' | 'holistic' | 'single_point',
        status: row.status as 'draft' | 'published' | 'archived',
        pointsPossible: row.points_possible,
        criteria: row.criteria as any,
        performanceLevels: row.performance_levels as any,
        sourceType: (row.source_type as 'canvas_assignment' | 'manual_input' | 'file_upload') || undefined,
        sourceAssignmentId: row.source_assignment_id || undefined,
        courseId: row.course_id || undefined,
        sourceContent: row.source_content || undefined,
        diverAlignment: row.diver_alignment as any,
        aiLiteracyComponents: row.ai_literacy_components as any,
        canvasRubricId: row.canvas_rubric_id || undefined,
        exportedToCanvas: row.exported_to_canvas || false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastUsedAt: row.last_used_at || undefined,
        usageCount: row.usage_count || 0
      }));
    } catch (error) {
      console.error('Error loading rubrics:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isSaving,
    isLoading,
    saveRubric,
    updateRubric,
    deleteRubric,
    loadRubrics
  };
};