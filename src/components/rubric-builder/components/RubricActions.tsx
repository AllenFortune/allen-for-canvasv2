import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Save, Download, RefreshCw } from 'lucide-react';

interface RubricActionsProps {
  isSaving: boolean;
  isExporting: boolean;
  isGenerating: boolean;
  canExportToCanvas: boolean;
  onSave: () => void;
  onExport?: () => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

const RubricActions: React.FC<RubricActionsProps> = ({
  isSaving,
  isExporting,
  isGenerating,
  canExportToCanvas,
  onSave,
  onExport,
  onRegenerate,
  showRegenerate = false
}) => {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button onClick={onSave} disabled={isSaving} className="flex-1">
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save to Library
          </>
        )}
      </Button>
      
      {showRegenerate && onRegenerate && (
        <Button
          onClick={onRegenerate}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </>
          )}
        </Button>
      )}
      
      {canExportToCanvas && onExport && (
        <Button
          onClick={onExport}
          disabled={isExporting}
          variant="outline"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export to Canvas
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default RubricActions;