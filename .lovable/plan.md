

## Plan: Add PDF Text Extraction to `process-document-content/index.ts`

### What changes

**File:** `supabase/functions/process-document-content/index.ts`

1. **Add import** at the top (after the mammoth import):
   ```typescript
   import pdf from "https://esm.sh/pdf-parse@1.1.1";
   ```

2. **Replace lines 175-180** (the current PDF block that returns a static placeholder) with actual extraction logic:
   ```typescript
   } else if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
     console.log('Processing .pdf file with pdf-parse');
     try {
       const uint8Array = new Uint8Array(fileBuffer);
       const data = await pdf(uint8Array);
       extractedText = data.text;
       
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
   ```

3. **Deploy** the edge function and test it.

### What does NOT change
- All .docx handling (Mammoth + fallback)
- All .txt handling
- Unsupported file type handling
- Response format and error handling
- No other files modified

