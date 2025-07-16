import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download, ExternalLink, Edit3, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

interface RubricViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubricId: string | null;
}

const RubricViewModal: React.FC<RubricViewModalProps> = ({
  isOpen,
  onClose,
  rubricId
}) => {
  const [rubric, setRubric] = useState<Tables<'rubrics'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const fetchRubric = async () => {
    if (!rubricId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rubrics')
        .select('*')
        .eq('id', rubricId)
        .single();

      if (error) throw error;
      
      setRubric(data);
    } catch (error) {
      console.error('Error fetching rubric:', error);
      toast({
        title: "Error",
        description: "Failed to load rubric details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportToCanvas = async () => {
    if (!rubric) return;
    
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-rubric-to-canvas', {
        body: { rubricId: rubric.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rubric exported to Canvas successfully!"
      });
    } catch (error) {
      console.error('Error exporting to Canvas:', error);
      toast({
        title: "Error",
        description: "Failed to export rubric to Canvas. Please check your Canvas connection.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadRubric = () => {
    if (!rubric) return;
    
    const content = JSON.stringify(rubric, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rubric.title.replace(/\s+/g, '_')}_rubric.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Rubric downloaded successfully!"
    });
  };

  useEffect(() => {
    if (isOpen && rubricId) {
      fetchRubric();
    }
  }, [isOpen, rubricId]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>Rubric Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading rubric...</span>
          </div>
        ) : rubric ? (
          <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
            <div className="space-y-6">
              {/* Header Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{rubric.title}</h2>
                  {rubric.description && (
                    <p className="text-muted-foreground">{rubric.description}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{rubric.rubric_type}</Badge>
                  <Badge variant="outline">{rubric.points_possible} points</Badge>
                  <Badge variant="outline">
                    Used {rubric.usage_count || 0} times
                  </Badge>
                  <Badge variant={rubric.status === 'published' ? 'default' : 'secondary'}>
                    {rubric.status}
                  </Badge>
                  {rubric.exported_to_canvas && (
                    <Badge variant="outline" className="text-green-600">
                      Exported to Canvas
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={downloadRubric} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {rubric.source_assignment_id && (
                    <Button 
                      onClick={handleExportToCanvas} 
                      variant="outline" 
                      size="sm"
                      disabled={exporting}
                    >
                      {exporting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ExternalLink className="w-4 h-4 mr-2" />
                      )}
                      Export to Canvas
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              {/* Performance Levels */}
              {rubric.performance_levels && Array.isArray(rubric.performance_levels) && rubric.performance_levels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(rubric.performance_levels as string[]).map((level, index) => (
                        <Badge key={index} variant="outline">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Criteria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(rubric.criteria) && (rubric.criteria as any[]).map((criterion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{criterion.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {criterion.description}
                      </p>
                      <Badge variant="outline">{criterion.points} points</Badge>
                      
                      {criterion.levels && criterion.levels.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Performance Levels:</h5>
                          <div className="grid gap-2">
                            {criterion.levels.map((level, levelIndex) => (
                              <div key={levelIndex} className="bg-muted/50 rounded p-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{level.name}</span>
                                  <Badge variant="secondary">
                                    {level.points} pts
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {level.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* DIVER Alignment */}
              {rubric.diver_alignment && typeof rubric.diver_alignment === 'object' && Object.keys(rubric.diver_alignment).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">DIVER Framework Alignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-muted/50 rounded p-3 overflow-auto">
                      {JSON.stringify(rubric.diver_alignment, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* AI Literacy Components */}
              {rubric.ai_literacy_components && Array.isArray(rubric.ai_literacy_components) && rubric.ai_literacy_components.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Literacy Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(rubric.ai_literacy_components as string[]).map((component, index) => (
                        <Badge key={index} variant="outline">
                          {component}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2">{new Date(rubric.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2">{new Date(rubric.updated_at).toLocaleDateString()}</span>
                    </div>
                    {rubric.last_used_at && (
                      <div>
                        <span className="font-medium">Last Used:</span>
                        <span className="ml-2">{new Date(rubric.last_used_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {rubric.source_type && (
                      <div>
                        <span className="font-medium">Source:</span>
                        <span className="ml-2">{rubric.source_type.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load rubric details.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RubricViewModal;