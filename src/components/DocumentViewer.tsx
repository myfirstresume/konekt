'use client';

import { useState, useEffect } from 'react';
import mammoth from 'mammoth';

interface DocumentViewerProps {
  documentPath: string;
  highlights?: Array<{
    id: string;
    text: string;
    position: { start: number; end: number };
    category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
  }>;
  onHighlightClick?: (commentId: string) => void;
}

export default function DocumentViewer({ documentPath, highlights = [], onHighlightClick }: DocumentViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(documentPath);
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        setContent(result.value);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentPath]);

  // Set up global click handler for highlights
  useEffect(() => {
    if (onHighlightClick) {
      (window as { highlightClickHandler?: (id: string) => void }).highlightClickHandler = onHighlightClick;
    }

    return () => {
      delete (window as { highlightClickHandler?: (id: string) => void }).highlightClickHandler;
    };
  }, [onHighlightClick]);

  const renderContentWithHighlights = () => {
    if (!content) return null;

    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Get all text nodes and apply highlights
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    // Apply highlights to text nodes
    highlights.forEach(highlight => {
      const { id, position, category } = highlight;
      
      // Find the text node that contains this position
      let currentPos = 0;
      for (const textNode of textNodes) {
        const nodeLength = textNode.textContent?.length || 0;
        
        if (position.start >= currentPos && position.start < currentPos + nodeLength) {
          // This text node contains the highlight
          const startOffset = position.start - currentPos;
          const endOffset = Math.min(position.end - currentPos, nodeLength);
          
          if (startOffset < endOffset) {
            const range = document.createRange();
            range.setStart(textNode, startOffset);
            range.setEnd(textNode, endOffset);
            
            const highlightSpan = document.createElement('span');
            highlightSpan.className = `highlight-${category} cursor-pointer`;
            highlightSpan.setAttribute('data-comment-id', id);
            highlightSpan.setAttribute('onclick', `window.highlightClickHandler && window.highlightClickHandler('${id}')`);
            highlightSpan.style.backgroundColor = category === 'clarity' ? '#dbeafe' : '#fecaca';
            highlightSpan.style.borderRadius = '2px';
            highlightSpan.style.padding = '1px 2px';
            highlightSpan.style.cursor = 'pointer';
            highlightSpan.style.transition = 'background-color 0.2s';
            
            range.surroundContents(highlightSpan);
            break;
          }
        }
        currentPos += nodeLength;
      }
    });

    return (
      <div 
        className="max-w-none"
        style={{
          fontFamily: 'inherit',
          lineHeight: 'inherit',
        }}
        dangerouslySetInnerHTML={{ __html: tempDiv.innerHTML }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 animate-spin text-mfr-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Document</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <style jsx>{`
        .document-content {
          font-family: inherit;
          line-height: 1.6;
          color: #000000 !important;
          text-align: left;
        }
        .document-content * {
          color: inherit !important;
        }
        .document-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #000000 !important;
          text-align: center;
        }
        .document-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #000000 !important;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .document-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #000000 !important;
        }
        .document-content p {
          margin-bottom: 0.75rem;
          color: #000000 !important;
          text-align: left;
          line-height: 1.5;
        }
        .document-content ul {
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          list-style-type: disc;
        }
        .document-content li {
          margin-bottom: 0.5rem;
          color: #000000 !important;
          line-height: 1.4;
          padding-left: 0.25rem;
        }
        .document-content strong {
          font-weight: 600;
          color: #000000 !important;
        }
        .document-content em {
          font-style: italic;
          color: #000000 !important;
        }
        .document-content .job-title {
          font-weight: 600;
          color: #000000 !important;
        }
        .document-content .company {
          color: #374151 !important;
          font-style: italic;
        }
        .document-content .date {
          color: #6b7280 !important;
          font-size: 0.875rem;
        }
        .document-content div {
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        .document-content span {
          display: inline;
        }
        .highlight-clarity:hover {
          background-color: #bfdbfe !important;
        }
        .highlight-word-choice:hover {
          background-color: #fca5a5 !important;
        }
        .highlight-grammar:hover {
          background-color: #fca5a5 !important;
        }
        .highlight-content:hover {
          background-color: #bfdbfe !important;
        }
        .highlight-formatting:hover {
          background-color: #fef3c7 !important;
        }
        .highlight-suggestion:hover {
          background-color: #bbf7d0 !important;
        }
      `}</style>
      <div className="document-content">
        {renderContentWithHighlights()}
      </div>
    </div>
  );
}
