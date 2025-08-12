import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Configure DOMPurify for safe HTML content
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true
  };

  // Sanitize the HTML
  const sanitized = DOMPurify.sanitize(html, config);
  
  // Ensure external links open in new tab with security attributes
  return sanitized.replace(
    /<a\s+([^>]*href=["'](?:https?:\/\/[^"']+)["'][^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer">'
  );
};

/**
 * Sanitizes HTML content specifically for user submissions and discussions
 * More restrictive than general sanitization
 */
export const sanitizeUserContent = (html: string): string => {
  if (!html) return '';
  
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORBID_ATTR: ['style', 'class', 'id', 'onclick', 'onerror', 'onload'],
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button', 'img'],
    KEEP_CONTENT: true,
    SANITIZE_DOM: true
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Strips all HTML tags and returns plain text
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, { 
    ALLOWED_TAGS: [], 
    KEEP_CONTENT: true 
  });
};