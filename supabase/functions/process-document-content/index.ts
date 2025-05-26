
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

    console.log('Processing document:', fileName, 'Type:', mimeType, 'URL:', fileUrl);

    // Download the file with proper headers
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocumentProcessor/1.0)',
      }
    });
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    console.log('Downloaded file size:', fileSize, 'bytes');

    let extractedText = '';

    // Process based on file type
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        fileName.toLowerCase().endsWith('.docx')) {
      
      console.log('Processing .docx file');
      
      // Convert ArrayBuffer to Uint8Array for processing
      const uint8Array = new Uint8Array(fileBuffer);
      
      // For .docx files, we need to extract from the ZIP structure
      // This is a simplified approach - for production, consider using a proper docx parser
      try {
        // Convert to string and look for document content
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const fileContent = decoder.decode(uint8Array);
        
        // Look for text content in the document.xml part of the docx
        // .docx files contain XML with text in <w:t> tags
        const textMatches = fileContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
        if (textMatches && textMatches.length > 0) {
          extractedText = textMatches
            .map(match => {
              // Extract text between the tags and decode XML entities
              const text = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1');
              return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            })
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        // If no text found with w:t tags, try alternative extraction
        if (!extractedText || extractedText.length < 10) {
          // Look for any readable text in the file
          const readableText = fileContent.match(/[a-zA-Z0-9\s.,!?;:()"\-']{10,}/g);
          if (readableText) {
            extractedText = readableText
              .filter(text => text.trim().length > 5)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }

        console.log('Extracted text length:', extractedText.length);
        
        if (!extractedText || extractedText.length < 5) {
          extractedText = `[DOCX file "${fileName}" was processed but no readable text content could be extracted. The file may be empty, corrupted, or contain only images/formatting. Please ask the student to resubmit as plain text or verify the file content.]`;
        }
        
      } catch (extractError) {
        console.error('Error extracting from docx:', extractError);
        extractedText = `[DOCX file "${fileName}" could not be processed due to formatting issues. Please ask the student to resubmit as plain text or a different format.]`;
      }
      
    } else if (mimeType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')) {
      // Plain text files
      console.log('Processing .txt file');
      const textDecoder = new TextDecoder('utf-8');
      extractedText = textDecoder.decode(fileBuffer);
      
    } else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // For PDF files, we'll return a message indicating manual review needed
      console.log('Processing .pdf file - manual review needed');
      extractedText = `[PDF Document "${fileName}" submitted - Manual review required for detailed content analysis. AI grading will be based on assignment requirements only.]`;
      
    } else {
      // Unsupported file type
      console.log('Unsupported file type:', mimeType);
      extractedText = `[File "${fileName}" (${mimeType}) - Unsupported file type for automatic text extraction. Please ask student to resubmit as .docx or .txt file.]`;
    }

    console.log('Final extracted text length:', extractedText.length);
    console.log('Extracted text preview:', extractedText.substring(0, 200));

    return new Response(JSON.stringify({ 
      extractedText,
      fileName,
      fileSize,
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
