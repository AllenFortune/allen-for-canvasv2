
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface InlineFilePreviewProps {
  attachment: {
    filename?: string;
    display_name?: string;
    url: string;
    'content-type'?: string;
    size?: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
}

const InlineFilePreview: React.FC<InlineFilePreviewProps> = ({ 
  attachment, 
  isExpanded, 
  onToggle 
}) => {
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
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm font-medium mb-1">Preview not available</p>
          <p className="text-xs text-center mb-3">
            This file type cannot be previewed. You can download it to view the content.
          </p>
          <Button size="sm" asChild>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Download className="w-3 h-3 mr-1" />
              Download
            </a>
          </Button>
        </div>
      );
    }

    // PDF files
    if (contentType.includes('pdf') || fileExtension === 'pdf') {
      // For Canvas URLs, try multiple preview parameters to force inline display
      let pdfUrl = attachment.url;
      if (attachment.url.includes('/files/') && (attachment.url.includes('/courses/') || attachment.url.includes('canvas'))) {
        // Try multiple Canvas parameters in order of likelihood to work
        const separator = attachment.url.includes('?') ? '&' : '?';
        const canvasParams = [
          'inline=1',
          'disposition=inline', 
          'download=0',
          'wrap=1',
          'preview=1&inline=1',
          'verifier='
        ];
        
        // Try the first parameter combination (most likely to work)
        pdfUrl = `${attachment.url}${separator}${canvasParams[0]}`;
        console.log('Trying Canvas PDF preview with parameters:', pdfUrl);
      }
      
      return (
        <div className="relative h-96 bg-white rounded border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0 rounded"
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
        <div className="flex justify-center items-center p-4 bg-gray-50 rounded">
          {loading && (
            <Skeleton className="w-full h-64" />
          )}
          <img
            src={attachment.url}
            alt={fileName}
            className="max-w-full max-h-64 object-contain rounded"
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
        <div className="relative h-64 bg-white rounded border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={attachment.url}
            className="w-full h-full border-0 rounded"
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
        <div className="relative h-96 bg-white rounded border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0 rounded"
            title={fileName}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium mb-1">Preview not available</p>
        <p className="text-xs text-center mb-3">
          This file type ({fileExtension.toUpperCase()}) cannot be previewed.
        </p>
        <Button size="sm" asChild>
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            <Download className="w-3 h-3 mr-1" />
            Download
          </a>
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isExpanded ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex items-center gap-2 text-green-600 hover:text-green-800 hover:bg-green-50"
        >
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4" />
            Download
          </a>
        </Button>
      </div>
      
      {isExpanded && (
        <div className="border rounded-lg p-2 bg-white">
          {getPreviewContent()}
        </div>
      )}
    </div>
  );
};

export default InlineFilePreview;
