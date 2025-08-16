
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
  const [selectedDiscussion, setSelectedDiscussion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'assignment' | 'discussion'>('assignment');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleAssignmentImport = (assignment: {
    courseId?: string;
    assignmentId?: string;
    discussionId?: string;
    type?: 'assignment' | 'discussion';
  }) => {
    if (assignment.courseId) {
      setSelectedCourse(assignment.courseId);
      if (assignment.type) {
        setSelectedType(assignment.type);
      }
      if (assignment.assignmentId) {
        setSelectedAssignment(assignment.assignmentId);
        setSelectedDiscussion('');
      }
      if (assignment.discussionId) {
        setSelectedDiscussion(assignment.discussionId);
        setSelectedAssignment('');
      }
    }
  };

  const handleExport = async () => {
    if (!selectedCourse || (!selectedAssignment && !selectedDiscussion)) {
      toast({
        title: "Error",
        description: "Please select both a course and an assignment or discussion.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);

    try {
      // First update the rubric with the new assignment/discussion and course IDs
      const updateData: any = {
        course_id: parseInt(selectedCourse),
        updated_at: new Date().toISOString()
      };
      
      if (selectedType === 'assignment' && selectedAssignment) {
        updateData.source_assignment_id = parseInt(selectedAssignment);
      }
      
      const { error: updateError } = await supabase
        .from('rubrics')
        .update(updateData)
        .eq('id', rubricId);

      if (updateError) throw updateError;

      // Then export to Canvas with appropriate IDs and type
      const exportBody: any = { 
        rubricId,
        courseId: parseInt(selectedCourse),
        associationType: selectedType
      };
      
      if (selectedType === 'assignment' && selectedAssignment) {
        exportBody.assignmentId = parseInt(selectedAssignment);
      } else if (selectedType === 'discussion' && selectedDiscussion) {
        exportBody.discussionId = parseInt(selectedDiscussion);
      }

      const { data, error } = await supabase.functions.invoke('export-rubric-to-canvas', {
        body: exportBody
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
    setSelectedDiscussion('');
    setSelectedType('assignment');
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
              Select the Canvas assignment or discussion where you want to export "<strong>{rubricTitle}</strong>".
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
              disabled={!selectedCourse || (!selectedAssignment && !selectedDiscussion) || isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to {selectedType === 'assignment' ? 'Assignment' : 'Discussion'}
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
