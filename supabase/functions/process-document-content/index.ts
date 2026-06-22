import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// NOTE: heavy parsers (jszip for .docx, pdf-parse for .pdf) are imported lazily
// inside their branches. Importing them at the top level crashes the function on
// boot under Deno (WORKER_ERROR / 500 on every request, including docx/txt).

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Extracts text from a .docx by unzipping it and reading word/document.xml.
 * A .docx is a ZIP archive, so the text is compressed and cannot be found by
 * scanning the raw file bytes — it must be inflated first.
 */
async function extractTextFromDocx(fileBuffer: ArrayBuffer, fileName: string): Promise<string> {
  console.log(`Unzipping .docx to extract text: ${fileName}`);
  const jszipModule = await import("https://esm.sh/jszip@3.10.1");
  const JSZip = jszipModule.default ?? jszipModule;

  const zip = await JSZip.loadAsync(fileBuffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) {
    console.warn("word/document.xml not found in .docx");
    return "";
  }

  const xml: string = await documentFile.async("string");

  // Convert the WordprocessingML into plain text: turn paragraph/break/tab
  // markers into whitespace, strip the remaining tags, keep the run text.
  const text = decodeXmlEntities(
    xml
      .replace(/<w:tab\b[^>]*\/?>/g, '\t')
      .replace(/<w:br\b[^>]*\/?>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  console.log(`Extracted ${text.length} characters from .docx`);
  return text;
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

      console.log('Processing .docx file');

      try {
        extractedText = await extractTextFromDocx(fileBuffer, fileName);
      } catch (docxError) {
        console.error('.docx extraction failed:', docxError);
        extractedText = '';
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
      console.log('Processing .pdf file with pdf-parse');
      try {
        const pdfModule = await import("https://esm.sh/pdf-parse@1.1.1");
        const pdf = pdfModule.default ?? pdfModule;
        const uint8Array = new Uint8Array(fileBuffer);
        const data = await pdf(uint8Array);
        extractedText = data.text || '';

        // Clean up whitespace
        extractedText = extractedText
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/[ \t]+/g, ' ')
          .trim();

        console.log(`PDF text extracted: ${extractedText.length} characters`);
        console.log(`PDF text preview: ${extractedText.substring(0, 200)}...`);
      } catch (pdfError) {
        console.error('PDF extraction failed:', pdfError);
        extractedText = '';
      }

      if (!extractedText || extractedText.length < 10) {
        extractedText = `[PDF Document "${fileName}" submitted - The file may be a scanned image or contain no extractable text. Manual review required for detailed content analysis.]`;
      }

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
