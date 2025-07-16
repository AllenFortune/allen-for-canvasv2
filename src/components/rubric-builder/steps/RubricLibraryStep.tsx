import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Library, Download, Trash2, Eye, Plus } from 'lucide-react';
import { RubricBuilderState } from '@/types/rubric';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import RubricViewModal from '../RubricViewModal';

interface RubricLibraryStepProps {
  state: RubricBuilderState;
  updateState: (updates: Partial<RubricBuilderState>) => void;
  onPrevious: () => void;
  onRestart: () => void;
}

interface SavedRubric {
  id: string;
  title: string;
  description: string | null;
  rubric_type: string;
  points_possible: number;
  created_at: string;
  usage_count: number | null;
  status: string;
}

const RubricLibraryStep: React.FC<RubricLibraryStepProps> = ({
  state,
  updateState,
  onPrevious,
  onRestart
}) => {
  const [rubrics, setRubrics] = useState<SavedRubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingRubric, setViewingRubric] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRubrics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .select('id, title, description, rubric_type, points_possible, created_at, usage_count, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setRubrics(data || []);
    } catch (error) {
      console.error('Error fetching rubrics:', error);
      toast({
        title: "Error",
        description: "Failed to load your rubric library.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRubric = async (rubricId: string) => {
    setDeleting(rubricId);
    try {
      const { error } = await supabase
        .from('rubrics')
        .delete()
        .eq('id', rubricId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setRubrics(prev => prev.filter(r => r.id !== rubricId));
      toast({
        title: "Success",
        description: "Rubric deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting rubric:', error);
      toast({
        title: "Error",
        description: "Failed to delete rubric.",
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleViewRubric = (rubricId: string) => {
    setViewingRubric(rubricId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setViewingRubric(null);
  };

  useEffect(() => {
    fetchRubrics();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Rubric Library</h3>
        <p className="text-muted-foreground">
          Manage your saved rubrics and create new ones
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={onRestart} className="flex-1">
          <Plus className="w-4 h-4 mr-2" />
          Create New Rubric
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Library className="w-5 h-5 mr-2" />
            Your Rubrics ({rubrics.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading rubrics...</span>
            </div>
          ) : rubrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rubrics in your library yet.</p>
              <p className="text-sm">Create your first AI-generated rubric!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rubrics.map((rubric) => (
                <div key={rubric.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{rubric.title}</h4>
                      {rubric.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {rubric.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{rubric.rubric_type}</Badge>
                        <Badge variant="outline">{rubric.points_possible} points</Badge>
                        <Badge variant="outline">
                          Used {rubric.usage_count || 0} times
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(rubric.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewRubric(rubric.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteRubric(rubric.id)}
                        disabled={deleting === rubric.id}
                      >
                        {deleting === rubric.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onRestart}>
          Create Another Rubric
        </Button>
      </div>

      <RubricViewModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        rubricId={viewingRubric}
      />
    </div>
  );
};

export default RubricLibraryStep;