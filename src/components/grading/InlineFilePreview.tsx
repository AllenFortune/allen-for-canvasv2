
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

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

  // Helper function to detect Canvas file URLs
  const isCanvasFile = (url: string): boolean => {
    return url.includes('/files/') && (url.includes('/courses/') || url.includes('canvas'));
  };

  // Helper function to generate Canvas proxy URL for PDFs
  const getCanvasProxyUrl = async (fileUrl: string): Promise<string | null> => {
    try {
      const response = await supabase.functions.invoke('canvas-file-proxy', {
        body: { fileUrl }
      });
      
      if (response.error) {
        console.error('Canvas file proxy error:', response.error);
        return null;
      }
      
      // The response.data should be the file blob directly
      if (response.data) {
        // Create a blob URL from the response data for iframe display
        const blob = new Blob([response.data], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      }
      
      return null;
    } catch (error) {
      console.error('Error calling Canvas file proxy:', error);
      return null;
    }
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
      const PDFPreview = () => {
        const [proxyUrl, setProxyUrl] = useState<string | null>(null);
        const [proxyLoading, setProxyLoading] = useState(false);
        const [proxyError, setProxyError] = useState(false);

        React.useEffect(() => {
          if (isCanvasFile(attachment.url)) {
            setProxyLoading(true);
            getCanvasProxyUrl(attachment.url)
              .then((url) => {
                if (url) {
                  setProxyUrl(url);
                } else {
                  setProxyError(true);
                }
              })
              .catch(() => {
                setProxyError(true);
              })
              .finally(() => {
                setProxyLoading(false);
              });
          }
        }, []);

        // Use proxy URL for Canvas files, direct URL for others
        const pdfUrl = isCanvasFile(attachment.url) ? proxyUrl : attachment.url;

        if (isCanvasFile(attachment.url) && proxyLoading) {
          return (
            <div className="relative h-96 bg-white rounded border">
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-gray-500">Loading Canvas file...</span>
                </div>
              </div>
            </div>
          );
        }

        if (isCanvasFile(attachment.url) && proxyError) {
          return (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium mb-1">Canvas file preview failed</p>
              <p className="text-xs text-center mb-3">
                Unable to load Canvas file. You can download it to view the content.
              </p>
              <Button size="sm" asChild>
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-3 h-3 mr-1" />
                  Download from Canvas
                </a>
              </Button>
            </div>
          );
        }

        if (!pdfUrl) {
          return null;
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
      };

      return <PDFPreview />;
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
