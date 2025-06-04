
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, RefreshCw, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AssignmentEditorProps {
  revisedAssignment: string;
  onRegenerate: () => void;
  loading: boolean;
}

const AssignmentEditor: React.FC<AssignmentEditorProps> = ({ 
  revisedAssignment, 
  onRegenerate, 
  loading 
}) => {
  const [editableAssignment, setEditableAssignment] = useState(revisedAssignment);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(editableAssignment);
    toast({
      title: "Assignment Copied",
      description: "The revised assignment has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editableAssignment], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revised-assignment.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Assignment Downloaded",
      description: "The revised assignment has been downloaded as a text file.",
    });
  };

  React.useEffect(() => {
    setEditableAssignment(revisedAssignment);
  }, [revisedAssignment]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-xl text-gray-900">
            <Edit className="w-5 h-5 mr-2" />
            Revised Assignment
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={onRegenerate} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={editableAssignment}
          onChange={(e) => setEditableAssignment(e.target.value)}
          className="min-h-[400px] text-sm leading-relaxed"
          placeholder="Your revised assignment will appear here..."
        />
        <p className="text-xs text-gray-500 mt-2">
          You can edit the assignment above. Use the buttons to copy or download your final version.
        </p>
      </CardContent>
    </Card>
  );
};

export default AssignmentEditor;
