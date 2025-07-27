// Simple markdown renderer for syllabus content
export const renderMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-foreground mb-3 mt-6 first:mt-0">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-foreground mb-4 mt-8 first:mt-0">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-foreground mb-4 mt-8 first:mt-0">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    // Lists
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc list-inside mb-1">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal list-inside mb-1">$2</li>')
    
    // Line breaks and paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    
    // Wrap in paragraph tags
    .replace(/^(.*)$/s, '<div class="prose prose-sm max-w-none"><p class="mb-4">$1</p></div>')
    
    // Clean up empty paragraphs
    .replace(/<p class="mb-4"><\/p>/g, '')
    .replace(/<p class="mb-4"><br><\/p>/g, '');
};

export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    .replace(/^#{1,6}\s+/gm, '') // Remove header symbols
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/^-\s+/gm, '• ') // Convert bullet points
    .replace(/^\d+\.\s+/gm, '') // Remove numbered list numbers
    .trim();
};