
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from 'lucide-react';
import CanvasAssignmentSelector from '@/components/ai-assignment/CanvasAssignmentSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssignmentExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rubricId: string;
  rubricTitle: string;
}

const AssignmentExportModal: React.FC<AssignmentExportModalProps> = ({
  isOpen,
  onClose,
  rubricId,
  rubricTitle
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleAssignmentImport = (assignment: {
    courseId?: string;
    assignmentId?: string;
  }) => {
    if (assignment.courseId && assignment.assignmentId) {
      setSelectedCourse(assignment.courseId);
      setSelectedAssignment(assignment.assignmentId);
    }
  };

  const handleExport = async () => {
    if (!selectedCourse || !selectedAssignment) {
      toast({
        title: "Error",
        description: "Please select both a course and assignment.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // First update the rubric with the new assignment and course IDs
      const { error: updateError } = await supabase
        .from('rubrics')
        .update({
          source_assignment_id: parseInt(selectedAssignment),
          course_id: parseInt(selectedCourse),
          updated_at: new Date().toISOString()
        })
        .eq('id', rubricId);

      if (updateError) throw updateError;

      // Then export to Canvas with assignment and course IDs
      const { data, error } = await supabase.functions.invoke('export-rubric-to-canvas', {
        body: { 
          rubricId,
          assignmentId: parseInt(selectedAssignment),
          courseId: parseInt(selectedCourse)
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Export Successful",
          description: `"${rubricTitle}" has been exported to the selected Canvas assignment!`
        });
        onClose();
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting rubric:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export rubric to Canvas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setSelectedCourse('');
    setSelectedAssignment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Rubric to Canvas Assignment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Select the Canvas assignment where you want to export "<strong>{rubricTitle}</strong>".
            </p>
          </div>

          <CanvasAssignmentSelector
            onAssignmentImported={handleAssignmentImport}
            loading={isExporting}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!selectedCourse || !selectedAssignment || isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Assignment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentExportModal;
