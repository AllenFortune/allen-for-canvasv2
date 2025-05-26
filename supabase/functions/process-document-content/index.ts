
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, mimeType } = await req.json();

    console.log('Processing document:', fileName, 'Type:', mimeType);

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    let extractedText = '';

    // Process based on file type
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.toLowerCase().endsWith('.docx')) {
      // For .docx files, we'll use a simple text extraction approach
      // Note: This is a basic implementation. For production, consider using a more robust library
      const textDecoder = new TextDecoder();
      const fileText = textDecoder.decode(fileBuffer);
      
      // Basic text extraction from docx (looks for text between XML tags)
      const textMatches = fileText.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.replace(/<[^>]*>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    } else if (mimeType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      // Plain text files
      const textDecoder = new TextDecoder();
      extractedText = textDecoder.decode(fileBuffer);
    } else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // For PDF files, we'll return a message indicating manual review needed
      extractedText = '[PDF Document Submitted - Manual review required for detailed content analysis]';
    } else {
      // Unsupported file type
      extractedText = `[${fileName} - Unsupported file type for automatic text extraction]`;
    }

    console.log('Extracted text length:', extractedText.length);

    return new Response(JSON.stringify({ 
      extractedText,
      fileName,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process document',
      details: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
