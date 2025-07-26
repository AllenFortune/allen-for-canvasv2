import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Upload, File, X } from 'lucide-react';

interface KnowledgeBaseStepProps {
  data: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
}

export const KnowledgeBaseStep: React.FC<KnowledgeBaseStepProps> = ({ data, onUpdate, onNext }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);

    try {
      const newFiles = [];
      
      for (const file of Array.from(files)) {
        // Read file content
        const content = await readFileContent(file);
        
        newFiles.push({
          filename: file.name,
          content: content,
          type: file.type,
          size: file.size
        });
      }

      // Update knowledge base files
      const updatedFiles = [...(data.knowledge_base_files || []), ...newFiles];
      onUpdate({ knowledge_base_files: updatedFiles });

      toast({
        title: "Files Uploaded",
        description: `Successfully uploaded ${newFiles.length} file(s).`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }

    setUploading(false);
    // Reset input
    event.target.value = '';
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type.includes('text') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        // For non-text files, we'll need to process them differently
        reader.readAsText(file);
      }
    });
  };

  const removeFile = (index: number) => {
    const updatedFiles = data.knowledge_base_files.filter((_: any, i: number) => i !== index);
    onUpdate({ knowledge_base_files: updatedFiles });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Knowledge Base Setup</h3>
          <p className="text-muted-foreground">Upload course materials to train your teaching assistant</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Course Materials
          </CardTitle>
          <CardDescription>
            Upload syllabi, lecture notes, textbook chapters, assignments, and other course materials. 
            Supported formats: PDF, Word, Text, Markdown
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-lg font-medium mb-2">
                Click to upload files or drag and drop
              </div>
              <div className="text-sm text-muted-foreground">
                PDF, DOC, DOCX, TXT, MD files up to 10MB each
              </div>
            </Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="text-center py-4">
              <div className="text-sm text-muted-foreground">Uploading files...</div>
            </div>
          )}

          {/* File List */}
          {data.knowledge_base_files && data.knowledge_base_files.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({data.knowledge_base_files.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.knowledge_base_files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{file.filename}</div>
                        {file.size && (
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Knowledge Base Tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Include course syllabi and learning objectives</li>
              <li>• Upload lecture notes and presentation slides</li>
              <li>• Add textbook chapters and reading materials</li>
              <li>• Include sample problems and solutions</li>
              <li>• Add grading rubrics and assessment criteria</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Continue to Teaching Behavior
        </Button>
      </div>
    </div>
  );
};