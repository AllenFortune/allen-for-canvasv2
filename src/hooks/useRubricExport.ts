import { useState, useCallback } from 'react';
import { canvasService, CanvasExportRequest } from '@/services/canvasService';
import { useToast } from '@/hooks/use-toast';

export const useRubricExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCanvas = useCallback(async (request: CanvasExportRequest): Promise<boolean> => {
    setIsExporting(true);
    try {
      const result = await canvasService.exportRubricToCanvas(request);

      if (result.success) {
        toast({
          title: "Export Successful",
          description: "Rubric has been exported to Canvas successfully!"
        });
        return true;
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Error exporting rubric:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

  const testCanvasConnection = useCallback(async (userId: string): Promise<boolean> => {
    try {
      return await canvasService.testConnection(userId);
    } catch (error) {
      console.error('Canvas connection test failed:', error);
      return false;
    }
  }, []);

  return {
    isExporting,
    exportToCanvas,
    testCanvasConnection
  };
};