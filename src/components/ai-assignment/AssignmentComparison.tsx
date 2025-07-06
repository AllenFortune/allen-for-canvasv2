import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Sparkles, Edit3, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AssignmentComparisonProps {
  originalAssignment: {
    title: string;
    content: string;
  };
  revisedAssignment: string;
  onRevisedAssignmentChange: (content: string) => void;
  onRegenerate: () => void;
  loading: boolean;
}

const AssignmentComparison: React.FC<AssignmentComparisonProps> = ({
  originalAssignment,
  revisedAssignment,
  onRevisedAssignmentChange,
  onRegenerate,
  loading
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'comparison' | 'edit'>('comparison');

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(originalAssignment.content);
    toast({
      title: "Original Assignment Copied",
      description: "The original assignment content has been copied to your clipboard.",
    });
  };

  const handleCopyRevised = () => {
    navigator.clipboard.writeText(revisedAssignment);
    toast({
      title: "Revised Assignment Copied",
      description: "The AI-enhanced assignment content has been copied to your clipboard.",
    });
  };

  const handleDownload = () => {
    const content = `Original Assignment: ${originalAssignment.title}
${originalAssignment.content}

---

AI-Enhanced Assignment with AI Literacy Integration:
${revisedAssignment}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalAssignment.title}-comparison.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const originalWordCount = originalAssignment.content.split(/\s+/).filter(word => word.length > 0).length;
  const revisedWordCount = revisedAssignment.split(/\s+/).filter(word => word.length > 0).length;
  const wordDifference = revisedWordCount - originalWordCount;

  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-emerald-900 mb-2">
              Assignment Comparison & Editor
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-emerald-700">
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                Original: {originalWordCount} words
              </Badge>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                Enhanced: {revisedWordCount} words
              </Badge>
              <Badge 
                variant="outline" 
                className={`${wordDifference > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
              >
                {wordDifference > 0 ? '+' : ''}{wordDifference} words added
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onRegenerate}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
            >
              <Sparkles className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Regenerate'}
            </Button>
            <Button 
              onClick={handleDownload}
              variant="outline" 
              size="sm"
              className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Both
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'comparison' | 'edit')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison" className="flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Compare View
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Mode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Original Assignment */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-700">Original Assignment</CardTitle>
                    <Button 
                      onClick={handleCopyOriginal}
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {originalAssignment.content}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revised Assignment */}
              <Card className="border-2 border-emerald-200 bg-emerald-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-emerald-800">AI-Enhanced Assignment</CardTitle>
                    <Button 
                      onClick={handleCopyRevised}
                      variant="ghost" 
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="bg-emerald-200 text-emerald-800 w-fit">
                    with AI Literacy Integration
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-4 rounded-lg border border-emerald-200 max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {revisedAssignment}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-emerald-800">Edit AI-Enhanced Assignment</CardTitle>
                  <Button 
                    onClick={handleCopyRevised}
                    variant="outline" 
                    size="sm"
                    className="text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={revisedAssignment}
                  onChange={(e) => onRevisedAssignmentChange(e.target.value)}
                  rows={20}
                  className="w-full font-mono text-sm leading-relaxed resize-none border-emerald-200 focus:border-emerald-400"
                  placeholder="Your AI-enhanced assignment will appear here..."
                />
                <div className="mt-4 flex items-center gap-4 text-sm text-emerald-700">
                  <span>Words: {revisedWordCount}</span>
                  <span>Characters: {revisedAssignment.length}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AssignmentComparison;