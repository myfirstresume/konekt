'use client';

import { useEffect } from 'react';

interface DocumentViewerProps {
  content: string;
  highlights: Array<{
    id: string;
    position: { start: number; end: number };
    category: string;
  }>;
  onHighlightClick?: (commentId: string) => void;
}

export default function DocumentViewer({ content, highlights, onHighlightClick }: DocumentViewerProps) {
  // Remove the cleaning logic since it's now handled in the parent component
  // const MAX_CONSECUTIVE_NEWLINES = 2;

  // /**
  //  * Cleans excessive newlines from text
  //  */
  // const cleanExcessiveNewlines = (text: string, maxNewlines: number = MAX_CONSECUTIVE_NEWLINES): string => {
  //   if (!text) return text;
  //   const newlinePattern = new RegExp(`\\n{${maxNewlines + 1},}`, 'g');
  //   const cleanedText = text.replace(newlinePattern, '\n'.repeat(maxNewlines));
  //   return cleanedText;
  // };

  // useEffect(() => {
  //   const loadDocument = async () => {
  //     try {
  //       const response = await fetch('/api/get-sample-resume');
  //       if (response.ok) {
  //         const data = await response.json();
  //         const cleanedContent = cleanExcessiveNewlines(data.text, MAX_CONSECUTIVE_NEWLINES);
  //         setContent(cleanedContent);
  //       } else {
  //         console.error('Failed to load document');
  //       }
  //     } catch (err) {
  //       console.error('Error loading document:', err);
  //       throw new Error(`Failed to load sample resume: ${err}`);
  //     }
  //   };
  //   loadDocument();
  // }, []);

  // useEffect(() => {
  //   setContent(cleanExcessiveNewlines(content, MAX_CONSECUTIVE_NEWLINES));
  // }, [content]);

  const renderContentWithHighlights = () => {
    if (!content) return null;

    // Sort highlights by start position to process them in order
    const sortedHighlights = [...highlights].sort((a, b) => a.position.start - b.position.start);
    
    let result = '';
    let lastEnd = 0;

    sortedHighlights.forEach(highlight => {
      const { id, position, category } = highlight;
      
      // Add text before this highlight
      if (position.start > lastEnd) {
        result += content.substring(lastEnd, position.start);
      }
      
      // Add the highlighted text
      const highlightedText = content.substring(position.start, position.end);
      const highlightClass = `highlight-${category}`;
      const highlightStyle = category === 'clarity' ? 'background-color: #dbeafe' : 'background-color: #fecaca';
      
      result += `<span class="${highlightClass} cursor-pointer" data-comment-id="${id}" style="${highlightStyle}; border-radius: 2px; padding: 1px 2px; cursor: pointer; transition: background-color 0.2s;" onclick="window.highlightClickHandler && window.highlightClickHandler('${id}')">${highlightedText}</span>`;
      
      lastEnd = position.end;
    });
    
    // Add remaining text after the last highlight
    if (lastEnd < content.length) {
      result += content.substring(lastEnd);
    }

    return result;
  };

  // Set up global click handler for highlights
  useEffect(() => {
    if (onHighlightClick) {
      (window as { highlightClickHandler?: (id: string) => void }).highlightClickHandler = onHighlightClick;
    }

    return () => {
      delete (window as { highlightClickHandler?: (id: string) => void }).highlightClickHandler;
    };
  }, [onHighlightClick]);

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="flex items-center space-x-2">
  //         <svg className="w-6 h-6 animate-spin text-mfr-primary" fill="none" viewBox="0 0 24 24">
  //           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  //           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  //         </svg>
  //         <span className="text-gray-600">Loading document...</span>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  //         </svg>
  //         <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Document</h3>
  //         <p className="text-gray-600">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <style jsx>{`
        .document-content {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #000000;
          text-align: left;
          white-space: pre-wrap;
          word-wrap: break-word;
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
      <div 
        className="document-content"
        dangerouslySetInnerHTML={{ __html: renderContentWithHighlights() || '' }}
      />
    </div>
  );
}
