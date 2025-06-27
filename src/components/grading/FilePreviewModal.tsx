
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: {
    filename?: string;
    display_name?: string;
    url: string;
    'content-type'?: string;
    size?: number;
  };
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ isOpen, onClose, attachment }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fileName = attachment.filename || attachment.display_name || 'Unknown file';
  const contentType = attachment['content-type'] || '';
  const fileExtension = fileName.toLowerCase().split('.').pop() || '';

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const getPreviewContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium mb-2">Preview not available</p>
          <p className="text-sm text-center mb-4">
            This file type cannot be previewed in the browser. You can download it to view the content.
          </p>
          <Button asChild>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Download File
            </a>
          </Button>
        </div>
      );
    }

    // PDF files
    if (contentType.includes('pdf') || fileExtension === 'pdf') {
      return (
        <div className="relative h-96 lg:h-[600px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={attachment.url}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // Image files
    if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      return (
        <div className="flex justify-center items-center p-4">
          {loading && (
            <Skeleton className="w-full h-96" />
          )}
          <img
            src={attachment.url}
            alt={fileName}
            className="max-w-full max-h-96 object-contain"
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: loading ? 'none' : 'block' }}
          />
        </div>
      );
    }

    // Text files
    if (contentType.includes('text/') || fileExtension === 'txt') {
      return (
        <div className="relative h-96 lg:h-[600px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={attachment.url}
            className="w-full h-full border-0 bg-white"
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // Word documents - use Google Docs viewer
    if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
        fileExtension === 'docx' || fileExtension === 'doc') {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(attachment.url)}&embedded=true`;
      return (
        <div className="relative h-96 lg:h-[600px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0"
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium mb-2">Preview not available</p>
        <p className="text-sm text-center mb-4">
          This file type ({fileExtension.toUpperCase()}) cannot be previewed in the browser.
        </p>
        <Button asChild>
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold truncate pr-4">
            {fileName}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="overflow-auto">
          {getPreviewContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
