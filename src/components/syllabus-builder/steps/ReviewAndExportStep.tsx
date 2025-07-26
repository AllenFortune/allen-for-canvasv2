import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Download, Eye, Copy, Check, Edit, Save, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GeneratedContent {
  enhancedSyllabus?: string;
  aiPolicies?: string;
  studentGuide?: string;
  canvasContent?: string;
}

interface SyllabusData {
  content: string;
  subject: string;
  gradeLevel: string;
  courseName: string;
  inputMethod: 'upload' | 'paste' | 'canvas';
  fileName?: string;
}

interface PolicyOptions {
  includeAcademicIntegrity: boolean;
  includePermittedUses: boolean;
  includeCitationGuidelines: boolean;
  includeAssignmentSpecific: boolean;
  policyTone: 'formal' | 'friendly' | 'balanced';
  enforcementLevel: 'strict' | 'moderate' | 'flexible';
}

interface ReviewAndExportStepProps {
  generatedContent: GeneratedContent;
  syllabusData: SyllabusData;
  policyOptions: PolicyOptions;
  onContentChange?: (content: GeneratedContent) => void;
}

const ReviewAndExportStep: React.FC<ReviewAndExportStepProps> = ({
  generatedContent,
  syllabusData,
  policyOptions,
  onContentChange
}) => {
  const { toast } = useToast();
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [editingItems, setEditingItems] = useState<Set<string>>(new Set());
  const [editedContent, setEditedContent] = useState<GeneratedContent>(generatedContent);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<Set<string>>(new Set());

  const contentItems = [
    {
      id: 'syllabus',
      title: 'Enhanced Syllabus',
      description: 'Your original syllabus with integrated AI policies',
      content: editedContent.enhancedSyllabus,
      downloadName: `${syllabusData.courseName}_Enhanced_Syllabus.pdf`,
      contentKey: 'enhancedSyllabus' as keyof GeneratedContent
    },
    {
      id: 'policies',
      title: 'AI Policy Document',
      description: 'Standalone policy document for reference',
      content: editedContent.aiPolicies,
      downloadName: `${syllabusData.courseName}_AI_Policies.pdf`,
      contentKey: 'aiPolicies' as keyof GeneratedContent
    },
    {
      id: 'guide',
      title: 'Student Use Guide',
      description: 'Step-by-step guide for responsible AI use',
      content: editedContent.studentGuide,
      downloadName: `${syllabusData.courseName}_Student_AI_Guide.pdf`,
      contentKey: 'studentGuide' as keyof GeneratedContent
    },
    {
      id: 'canvas',
      title: 'Canvas Resources',
      description: 'Ready-to-import content modules',
      content: editedContent.canvasContent,
      downloadName: `${syllabusData.courseName}_Canvas_Content.html`,
      contentKey: 'canvasContent' as keyof GeneratedContent
    }
  ];

  const handleCopy = async (content: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItems(prev => new Set([...prev, itemId]));
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard.",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (content: string, filename: string) => {
    // For now, download as text file. In a real implementation, 
    // you'd convert to PDF or proper format
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.txt').replace('.html', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${filename} is being downloaded.`,
    });
  };

  const handleDownloadAll = () => {
    contentItems.forEach(item => {
      if (item.content) {
        handleDownload(item.content, item.downloadName);
      }
    });
  };

  const handleEditToggle = (itemId: string) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleContentEdit = (itemId: string, contentKey: keyof GeneratedContent, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [contentKey]: value
    }));
    setHasUnsavedChanges(prev => new Set([...prev, itemId]));
  };

  const handleSaveChanges = (itemId: string) => {
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    setHasUnsavedChanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    
    onContentChange?.(editedContent);
    
    toast({
      title: "Changes saved",
      description: "Your edits have been saved successfully.",
    });
  };

  const handleCancelEdit = (itemId: string, contentKey: keyof GeneratedContent) => {
    // Revert to original content
    setEditedContent(prev => ({
      ...prev,
      [contentKey]: generatedContent[contentKey]
    }));
    
    setEditingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    
    setHasUnsavedChanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Your AI Resources Are Ready!</h3>
        <p className="text-muted-foreground">
          Review, copy, or download your generated content below.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={handleDownloadAll} variant="default">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      <Tabs defaultValue="syllabus" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {contentItems.map(item => (
            <TabsTrigger key={item.id} value={item.id} className="text-xs">
              {item.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {contentItems.map(item => (
          <TabsContent key={item.id} value={item.id}>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {editingItems.has(item.id) ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveChanges(item.id)}
                          disabled={!hasUnsavedChanges.has(item.id)}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelEdit(item.id, item.contentKey)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditToggle(item.id)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => item.content && handleCopy(item.content, item.id)}
                        >
                          {copiedItems.has(item.id) ? (
                            <Check className="w-4 h-4 mr-1" />
                          ) : (
                            <Copy className="w-4 h-4 mr-1" />
                          )}
                          {copiedItems.has(item.id) ? 'Copied' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => item.content && handleDownload(item.content, item.downloadName)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingItems.has(item.id) ? (
                  <div className="space-y-2">
                    <Textarea
                      value={item.content || ''}
                      onChange={(e) => handleContentEdit(item.id, item.contentKey, e.target.value)}
                      className="min-h-96 font-mono text-sm"
                      placeholder="Content will appear here after generation..."
                    />
                    {hasUnsavedChanges.has(item.id) && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        You have unsaved changes
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-foreground">
                      {item.content || 'Content will appear here after generation...'}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <strong>Review and customize:</strong> Edit the generated content to match your specific course needs and teaching style.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <strong>Distribute to students:</strong> Share the student guide and updated syllabus with your class.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <strong>Import to Canvas:</strong> Use the Canvas resources to create course modules and announcements.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">4</Badge>
              <div>
                <strong>Monitor and adjust:</strong> Update policies as needed based on student questions and course progression.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewAndExportStep;