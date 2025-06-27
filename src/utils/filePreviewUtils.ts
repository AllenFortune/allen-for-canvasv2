
export const getFilePreviewability = (filename: string, contentType?: string) => {
  const extension = filename.toLowerCase().split('.').pop() || '';
  const type = contentType || '';

  // PDF files
  if (type.includes('pdf') || extension === 'pdf') {
    return { canPreview: true, type: 'pdf' };
  }

  // Image files
  if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return { canPreview: true, type: 'image' };
  }

  // Text files
  if (type.includes('text/') || extension === 'txt') {
    return { canPreview: true, type: 'text' };
  }

  // Word documents
  if (type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || 
      extension === 'docx' || extension === 'doc') {
    return { canPreview: true, type: 'document' };
  }

  // Excel files
  if (type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || 
      extension === 'xlsx' || extension === 'xls') {
    return { canPreview: true, type: 'spreadsheet' };
  }

  // PowerPoint files
  if (type.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') || 
      extension === 'pptx' || extension === 'ppt') {
    return { canPreview: true, type: 'presentation' };
  }

  return { canPreview: false, type: 'unknown' };
};

export const getFileTypeIcon = (filename: string, contentType?: string) => {
  const { type } = getFilePreviewability(filename, contentType);
  
  switch (type) {
    case 'pdf':
      return '📕';
    case 'image':
      return '🖼️';
    case 'text':
      return '📝';
    case 'document':
      return '📄';
    case 'spreadsheet':
      return '📊';
    case 'presentation':
      return '📊';
    default:
      return '📎';
  }
};
