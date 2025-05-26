
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
      
      try {
        // For .docx files, we need to extract from the ZIP structure
        // Convert to binary string for processing
        let binaryString = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i]);
        }
        
        // Look for document.xml content (the main document content in .docx files)
        // .docx files are ZIP archives, so we look for the document.xml content
        const documentXmlMatch = binaryString.match(/document\.xml.*?(<\?xml.*?<\/w:document>)/s);
        
        if (documentXmlMatch && documentXmlMatch[1]) {
          const xmlContent = documentXmlMatch[1];
          console.log('Found document.xml content, length:', xmlContent.length);
          
          // Extract text from <w:t> tags (Word text elements)
          const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
          if (textMatches && textMatches.length > 0) {
            extractedText = textMatches
              .map(match => {
                // Extract text between the tags and decode XML entities
                const text = match.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1');
                return text
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')
                  .replace(/&quot;/g, '"')
                  .replace(/&apos;/g, "'");
              })
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }

        // If still no text found, try a more aggressive approach
        if (!extractedText || extractedText.length < 10) {
          console.log('Trying alternative extraction method');
          // Look for any text content in the document
          const allTextMatches = binaryString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
          if (allTextMatches) {
            extractedText = allTextMatches
              .map(match => match.replace(/<w:t[^>]*>([^<]+)<\/w:t>/, '$1'))
              .filter(text => text.trim().length > 0)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }

        console.log('Extracted text length:', extractedText.length);
        console.log('Extracted text preview:', extractedText.substring(0, 200));
        
        if (!extractedText || extractedText.length < 5) {
          extractedText = `[DOCX file "${fileName}" was processed but no readable text content could be extracted. The file may be empty, contain only images/formatting, or have a complex structure. Please ask the student to resubmit as plain text or verify the file content.]`;
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
