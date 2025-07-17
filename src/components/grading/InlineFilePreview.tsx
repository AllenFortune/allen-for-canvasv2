
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
  const [proxyError, setProxyError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { session } = useAuth();

  const fileName = attachment.filename || attachment.display_name || 'Unknown file';
  const contentType = attachment['content-type'] || '';
  const fileExtension = fileName.toLowerCase().split('.').pop() || '';

  // Enhanced Canvas file detection
  const isCanvasFile = (url: string): boolean => {
    const isCanvas = url.includes('.instructure.com') && 
                     url.includes('/files/') && 
                     url.includes('download');
    console.log('🔍 Canvas file detection:', { url, isCanvas });
    return isCanvas;
  };

  // Enhanced debugging info update
  const updateDebugInfo = (update: any) => {
    setDebugInfo(prev => {
      const newInfo = { ...prev, ...update, timestamp: new Date().toISOString() };
      console.log('🐛 Debug info update:', newInfo);
      return newInfo;
    });
  };

  console.log('🔍 InlineFilePreview render state:', {
    fileName,
    contentType,
    isExpanded,
    proxyUrl: proxyUrl ? `${proxyUrl.substring(0, 50)}...` : null,
    proxyLoading,
    proxyError,
    isCanvasFile: isCanvasFile(attachment.url),
    debugInfo
  });

  const handleLoad = () => {
    console.log('✅ File loaded successfully');
    setLoading(false);
    setError(false);
    updateDebugInfo({ loadStatus: 'success', loadTime: Date.now() });
  };

  const handleError = () => {
    console.log('❌ File failed to load');
    setLoading(false);
    setError(true);
    updateDebugInfo({ loadStatus: 'error', errorTime: Date.now() });
  };

  // Enhanced Canvas proxy URL generator with better state management
  const getCanvasProxyUrl = useCallback(async (fileUrl: string): Promise<string | null> => {
    console.log('🔄 Starting Canvas proxy URL generation for:', fileUrl);
    updateDebugInfo({ proxyStep: 'starting', fileUrl });
    
    try {
      if (!session?.access_token) {
        console.error('❌ No session token available for Canvas file proxy');
        setProxyError('No authentication token available');
        updateDebugInfo({ proxyStep: 'no-auth', error: 'No session token' });
        return null;
      }

      console.log('📡 Making Canvas proxy request...');
      updateDebugInfo({ proxyStep: 'making-request' });
      
      const response = await fetch('https://fnxbysvezshnikqboplh.supabase.co/functions/v1/canvas-file-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ fileUrl })
      });

      console.log('📡 Canvas proxy response status:', response.status, response.statusText);
      updateDebugInfo({ 
        proxyStep: 'response-received', 
        status: response.status, 
        statusText: response.statusText 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Canvas file proxy error:', response.status, errorData);
        setProxyError(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
        updateDebugInfo({ proxyStep: 'error', status: response.status, errorData });
        return null;
      }

      // Get the binary data as a blob
      const blob = await response.blob();
      console.log('📄 Blob created:', { 
        size: blob.size, 
        type: blob.type,
        sizeInMB: (blob.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      updateDebugInfo({ 
        proxyStep: 'blob-created', 
        blobSize: blob.size, 
        blobType: blob.type,
        blobSizeMB: (blob.size / 1024 / 1024).toFixed(2)
      });
      
      // Validate blob size and type
      if (blob.size === 0) {
        console.error('❌ Empty blob received from Canvas proxy');
        setProxyError('Empty file received from server');
        updateDebugInfo({ proxyStep: 'error', error: 'Empty blob' });
        return null;
      }

      if (!blob.type.includes('pdf') && !blob.type.includes('application/octet-stream')) {
        console.warn('⚠️ Unexpected blob type:', blob.type);
        updateDebugInfo({ proxyStep: 'warning', warning: 'Unexpected blob type', blobType: blob.type });
      }

      // Create a blob URL for iframe display
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created successfully:', blobUrl);
      updateDebugInfo({ 
        proxyStep: 'blob-url-created', 
        blobUrl: blobUrl.substring(0, 50) + '...',
        fullBlobUrl: blobUrl
      });
      
      setProxyError(null); // Clear any previous errors
      return blobUrl;
      
    } catch (error) {
      console.error('❌ Error calling Canvas file proxy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProxyError(errorMessage);
      updateDebugInfo({ proxyStep: 'exception', error: errorMessage });
      return null;
    }
  }, [session?.access_token]); // Fixed dependency array

  // Improved effect to manage Canvas proxy URL fetching
  useEffect(() => {
    console.log('🔄 Proxy effect triggered:', {
      isExpanded,
      isCanvasFile: isCanvasFile(attachment.url),
      isPdf: contentType.includes('pdf'),
      hasProxyUrl: !!proxyUrl,
      proxyLoading,
      proxyError
    });

    updateDebugInfo({
      effectTriggered: true,
      isExpanded,
      isCanvasFile: isCanvasFile(attachment.url),
      isPdf: contentType.includes('pdf'),
      hasProxyUrl: !!proxyUrl
    });

    if (!isExpanded || !isCanvasFile(attachment.url) || !contentType.includes('pdf')) {
      console.log('📂 Skipping proxy fetch - conditions not met');
      updateDebugInfo({ effectResult: 'skipped', reason: 'conditions not met' });
      return;
    }

    if (proxyUrl) {
      console.log('📂 Proxy URL already exists, skipping fetch');
      updateDebugInfo({ effectResult: 'skipped', reason: 'proxy URL exists' });
      return;
    }

    if (proxyLoading) {
      console.log('📂 Proxy already loading, skipping fetch');
      updateDebugInfo({ effectResult: 'skipped', reason: 'already loading' });
      return;
    }

    console.log('🚀 Starting Canvas PDF proxy fetch for expanded preview');
    updateDebugInfo({ effectResult: 'starting fetch' });
    setProxyLoading(true);
    setProxyError(null);
    
    getCanvasProxyUrl(attachment.url)
      .then((url) => {
        if (url) {
          console.log('✅ Setting proxy URL in state:', url.substring(0, 50) + '...');
          updateDebugInfo({ fetchResult: 'success', proxyUrlSet: url.substring(0, 50) + '...' });
          setProxyUrl(url);
        } else {
          console.error('❌ Canvas proxy URL generation failed');
          updateDebugInfo({ fetchResult: 'failed', reason: 'null URL returned' });
          if (!proxyError) {
            setProxyError('Failed to generate proxy URL');
          }
        }
      })
      .catch((error) => {
        console.error('❌ Error getting Canvas proxy URL:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setProxyError(errorMessage);
        updateDebugInfo({ fetchResult: 'exception', error: errorMessage });
      })
      .finally(() => {
        setProxyLoading(false);
        updateDebugInfo({ fetchCompleted: true });
      });
  }, [attachment.url, isExpanded, contentType, proxyUrl, proxyLoading, getCanvasProxyUrl]);

  // Cleanup blob URL when component unmounts or new URL is created
  useEffect(() => {
    return () => {
      if (proxyUrl && proxyUrl.startsWith('blob:')) {
        console.log('🧹 Component cleanup - revoking blob URL:', proxyUrl);
        updateDebugInfo({ cleanup: 'blob URL revoked', revokedUrl: proxyUrl });
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
        </div>
      );
    }

    // PDF files
    if (contentType.includes('pdf') || fileExtension === 'pdf') {
      const PDFPreview = () => {
        // Use proxy URL for Canvas files, direct URL for others
        const pdfUrl = isCanvasFile(attachment.url) ? proxyUrl : attachment.url;
        console.log('🖼️ PDF URL for iframe:', pdfUrl);
        updateDebugInfo({ iframeUrl: pdfUrl, iframeAttempt: Date.now() });

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
                {proxyError && (
                  <p className="text-xs text-red-600 mb-2 font-mono bg-red-50 p-2 rounded">
                    Error: {proxyError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mb-2">
                  This may be due to Canvas permissions or file access restrictions.
                </p>
                {debugInfo && Object.keys(debugInfo).length > 0 && (
                  <details className="text-xs mb-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Show Debug Info
                    </summary>
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-left overflow-auto max-h-32">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                )}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      console.log('🔄 Manual retry requested');
                      updateDebugInfo({ manualRetry: Date.now() });
                      setProxyUrl(null);
                      setProxyError(null);
                      setDebugInfo({});
                    }}
                    className="mr-2"
                  >
                    Retry Preview
                  </Button>
                </div>
              </div>
            </div>
          );
        }

        if (!pdfUrl) {
          return (
            <div className="flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No PDF URL available</p>
            </div>
          );
        }

        return (
          <div className="relative">
            {debugInfo && Object.keys(debugInfo).length > 0 && (
              <details className="absolute top-2 right-2 z-10 bg-white border rounded p-1 shadow text-xs">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  Debug
                </summary>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32 min-w-64">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}
            <iframe
              src={pdfUrl}
              className="w-full h-96 border rounded"
              title={`PDF Preview: ${fileName}`}
              onLoad={() => {
                console.log('✅ PDF iframe loaded successfully');
                updateDebugInfo({ iframeLoaded: true, loadTime: Date.now() });
                handleLoad();
              }}
              onError={(e) => {
                console.error('❌ PDF iframe failed to load:', e);
                updateDebugInfo({ iframeError: true, errorTime: Date.now(), error: e });
                handleError();
              }}
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
        <p className="text-xs text-center">
          This file type ({fileExtension.toUpperCase()}) cannot be previewed.
        </p>
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
