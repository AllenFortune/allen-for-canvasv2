
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Import mammoth for better .docx processing
import mammoth from "https://esm.sh/mammoth@1.6.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Extracts text from a .docx file using Mammoth library
 * @param arrayBuffer ArrayBuffer of the .docx file
 * @param fileName Name of the file for logging
 * @returns Extracted text content
 */
async function extractTextFromDocxWithMammoth(arrayBuffer: ArrayBuffer, fileName: string): Promise<string> {
  try {
    console.log(`Using Mammoth to extract text from: ${fileName}`);
    
    // Use mammoth to extract raw text from the .docx file
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (result.value && result.value.trim().length > 0) {
      const textLength = result.value.length;
      console.log(`Successfully extracted text using Mammoth (${textLength} characters)`);
      console.log(`Text preview: ${result.value.substring(0, Math.min(200, textLength))}...`);
      
      // Clean up the text - remove excessive whitespace but preserve paragraph breaks
      const cleanedText = result.value
        .replace(/\r\n/g, '\n')  // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n')  // Limit multiple line breaks to double
        .replace(/[ \t]+/g, ' ')  // Replace multiple spaces/tabs with single space
        .trim();
      
      return cleanedText;
    } else {
      console.warn("Mammoth extracted empty text from .docx file");
      return "";
    }
  } catch (error) {
    console.error("Error using Mammoth to extract .docx text:", error);
    throw error;
  }
}

/**
 * Fallback method for .docx extraction using manual XML parsing
 */
async function extractTextFromDocxFallback(fileBuffer: ArrayBuffer, fileName: string): Promise<string> {
  console.log('Using fallback method for .docx extraction');
  
  const uint8Array = new Uint8Array(fileBuffer);
  let extractedText = '';
  
  try {
    // Convert to binary string for processing
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    
    // Look for document.xml content (the main document content in .docx files)
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

    return extractedText;
  } catch (error) {
    console.error('Error in fallback .docx extraction:', error);
    return '';
  }
}

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
      
      console.log('Processing .docx file with enhanced extraction');
      
      try {
        // Try Mammoth first for better academic formatting support
        extractedText = await extractTextFromDocxWithMammoth(fileBuffer, fileName);
        
        // If Mammoth didn't extract enough content, try fallback method
        if (!extractedText || extractedText.length < 10) {
          console.log('Mammoth extraction insufficient, trying fallback method');
          extractedText = await extractTextFromDocxFallback(fileBuffer, fileName);
        }
        
      } catch (mammothError) {
        console.error('Mammoth extraction failed, using fallback:', mammothError);
        // Fall back to manual XML parsing if Mammoth fails
        extractedText = await extractTextFromDocxFallback(fileBuffer, fileName);
      }

      console.log('Final extracted text length:', extractedText.length);
      console.log('Final extracted text preview:', extractedText.substring(0, 200));
      
      if (!extractedText || extractedText.length < 5) {
        extractedText = `[DOCX file "${fileName}" was processed but no readable text content could be extracted. The file may be empty, contain only images/formatting, or have a complex structure. Please ask the student to resubmit as plain text or verify the file content.]`;
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

    console.log('Final processing complete, text length:', extractedText.length);

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
