import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Upload, Loader2 } from 'lucide-react';

interface RevisionActionsProps {
  selectedCount: number;
  onGenerateRevision: () => void;
  revisionLoading: boolean;
  showCanvasUpdate: boolean;
  onCanvasUpdate: () => void;
  canvasUpdateLoading: boolean;
  assignmentTitle?: string;
  assignmentSubject?: string;
}

const RevisionActions: React.FC<RevisionActionsProps> = ({
  selectedCount,
  onGenerateRevision,
  revisionLoading,
  showCanvasUpdate,
  onCanvasUpdate,
  canvasUpdateLoading,
  assignmentTitle,
  assignmentSubject
}) => {
  return (
    <div className="space-y-6">
      {/* Generate Revision Action */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Ready to Create Your Revised Assignment?
              </h3>
              <p className="text-purple-800 text-sm">
                Generate a new assignment description that integrates your selected AI literacy suggestions.
              </p>
            </div>
            <Button 
              onClick={onGenerateRevision}
              disabled={selectedCount === 0 || revisionLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className={`w-4 h-4 mr-2 ${revisionLoading ? 'animate-spin' : ''}`} />
              {revisionLoading ? 'Generating...' : 'Create Revised Assignment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Update Action */}
      {showCanvasUpdate && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Update Assignment in Canvas
                </h3>
                <p className="text-blue-800 text-sm">
                  Push your revised assignment with AI literacy integration back to Canvas.
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Update in Canvas
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Canvas Assignment</DialogTitle>
                    <DialogDescription>
                      This will update your Canvas assignment "{assignmentTitle}" with the revised content that includes AI literacy integration. 
                      The original assignment description will be replaced.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Course:</strong> {assignmentSubject || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Assignment:</strong> {assignmentTitle}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Action:</strong> Replace assignment description with AI-enhanced version
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={onCanvasUpdate}
                      disabled={canvasUpdateLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {canvasUpdateLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Confirm Update
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RevisionActions;