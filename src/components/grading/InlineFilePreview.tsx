import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  onToggle,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [proxyLoading, setProxyLoading] = useState(false);
  const [proxyError, setProxyError] = useState(false);
  const { session } = useAuth();

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

  // Enhanced Canvas file detection
  const isCanvasFile = (url: string): boolean => {
    const isCanvas = url.includes('.instructure.com') && 
                     url.includes('/files/') && 
                     url.includes('download');
    console.log('Canvas file detection:', { url, isCanvas });
    return isCanvas;
  };

  // Enhanced Canvas proxy URL generator with comprehensive logging
  const getCanvasProxyUrl = useCallback(async (fileUrl: string): Promise<string | null> => {
    console.log('🔄 Starting Canvas proxy URL generation for:', fileUrl);
    
    try {
      if (!session?.access_token) {
        console.error('❌ No session token available for Canvas file proxy');
        return null;
      }

      console.log('📡 Making Canvas proxy request...');
      const response = await fetch('https://fnxbysvezshnikqboplh.supabase.co/functions/v1/canvas-file-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ fileUrl })
      });

      console.log('📡 Canvas proxy response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Canvas file proxy error:', response.status, errorData);
        return null;
      }

      // Get the binary data as a blob
      const blob = await response.blob();
      console.log('📄 Blob created:', { size: blob.size, type: blob.type });
      
      // Validate blob size and type
      if (blob.size === 0) {
        console.error('❌ Empty blob received from Canvas proxy');
        return null;
      }

      // Create a blob URL for iframe display
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created successfully:', blobUrl);
      return blobUrl;
      
    } catch (error) {
      console.error('❌ Error calling Canvas file proxy:', error);
      return null;
    }
  }, [session?.access_token]);

  // Effect to manage Canvas proxy URL fetching
  useEffect(() => {
    if (!isExpanded || !isCanvasFile(attachment.url) || !contentType.includes('pdf')) {
      return;
    }

    console.log('🚀 Starting Canvas PDF proxy fetch for expanded preview');
    setProxyLoading(true);
    setProxyError(false);
    
    getCanvasProxyUrl(attachment.url)
      .then((url) => {
        if (url) {
          console.log('✅ Canvas proxy URL generated successfully');
          setProxyUrl(url);
        } else {
          console.error('❌ Canvas proxy URL generation failed');
          setProxyError(true);
        }
      })
      .catch((error) => {
        console.error('❌ Error getting Canvas proxy URL:', error);
        setProxyError(true);
      })
      .finally(() => {
        setProxyLoading(false);
      });

    // Cleanup function
    return () => {
      if (proxyUrl) {
        console.log('🧹 Cleaning up blob URL:', proxyUrl);
        URL.revokeObjectURL(proxyUrl);
      }
    };
  }, [attachment.url, isExpanded, getCanvasProxyUrl]);

  // Cleanup blob URL when component unmounts or URL changes
  useEffect(() => {
    return () => {
      if (proxyUrl) {
        console.log('🧹 Component cleanup - revoking blob URL:', proxyUrl);
        URL.revokeObjectURL(proxyUrl);
      }
    };
  }, [proxyUrl]);

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
        // Use proxy URL for Canvas files, direct URL for others
        const pdfUrl = isCanvasFile(attachment.url) ? proxyUrl : attachment.url;
        console.log('🖼️ PDF URL for iframe:', pdfUrl);

        if (isCanvasFile(attachment.url) && proxyLoading) {
          return (
            <div className="flex items-center justify-center p-8">
              <Skeleton className="h-64 w-full" />
              <p className="text-sm text-muted-foreground ml-2">Loading Canvas PDF preview...</p>
            </div>
          );
        }

        if (isCanvasFile(attachment.url) && (proxyError || !pdfUrl)) {
          return (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Unable to preview this Canvas PDF file
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  This may be due to Canvas permissions or file access restrictions.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(attachment.url, '_blank')}
                  className="mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          );
        }

        if (!pdfUrl) {
          return null;
        }

        return (
          <iframe
            src={pdfUrl}
            className="w-full h-96 border rounded"
            title={`PDF Preview: ${fileName}`}
            onLoad={() => {
              console.log('✅ PDF iframe loaded successfully');
              handleLoad();
            }}
            onError={(e) => {
              console.error('❌ PDF iframe failed to load:', e);
              handleError();
            }}
          />
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