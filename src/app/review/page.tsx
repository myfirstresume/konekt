'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentViewer from '@/components/DocumentViewer';

interface Comment {
  id: string;
  text: string;
  why: string;
  status: 'pending' | 'accepted' | 'rejected';
  position: { start: number; end: number };
  category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
  reference_text?: string;
}

export default function ReviewPage() {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [resumeText, setResumeText] = useState<string>('');
  const [cleanedResumeText, setCleanedResumeText] = useState<string>('');
  const [isCached, setIsCached] = useState(false);
  const [isReReviewing, setIsReReviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [hasAppliedChanges, setHasAppliedChanges] = useState(false);
  const [shouldGenerateReview, setShouldGenerateReview] = useState(true);

  // Configurable newline limit
  const MAX_CONSECUTIVE_NEWLINES = 3;

  /**
   * Cleans excessive newlines from text
   */
  const cleanExcessiveNewlines = (text: string, maxNewlines: number = MAX_CONSECUTIVE_NEWLINES): string => {
    if (!text) return text;
    const newlinePattern = new RegExp(`\\n{${maxNewlines + 1},}`, 'g');
    const cleanedText = text.replace(newlinePattern, '\n'.repeat(maxNewlines));
    return cleanedText;
  };

  useEffect(() => {
    const loadResumeText = async () => {
      try {
        const response = await fetch('/api/get-sample-resume');
        if (response.ok) {
          const data = await response.json();
          const originalText = data.text;
          const cleanedText = cleanExcessiveNewlines(originalText, MAX_CONSECUTIVE_NEWLINES);
          
          setResumeText(originalText);
          setCleanedResumeText(cleanedText);
          

        } else {
          throw new Error('Failed to load sample resume');
        }
      } catch (error) {
        console.error('Error loading resume text:', error);
        throw new Error(`Failed to load sample resume: ${error}`);
      }
    };

    loadResumeText();
  }, []);

  useEffect(() => {
    const generateComments = async () => {
      if (!cleanedResumeText || !shouldGenerateReview) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/assess-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resume: cleanedResumeText }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to assess resume');
        }

        const data = await response.json();
        
        // Check if response was cached
        setIsCached(data.cached || false);
        
        if (data.comments && data.comments.length > 0) {
          // Process comments to find exact positions using reference text
          const processedComments = data.comments.map((comment: Comment, index: number) => {
            // Find exact position using reference text in CLEANED text
            let exactPosition = null;
            if (comment.reference_text) {
              exactPosition = findTextPosition(cleanedResumeText, comment.reference_text);
            }
            
            // If we found the exact position, use it; otherwise fall back to AI position
            const finalPosition = exactPosition || comment.position;
            
            return {
              ...comment,
              position: finalPosition
            };
          });
          
          setComments(processedComments);
        } else {
          setError('No comments were generated. Please try again.');
        }
      } catch (err) {
        console.error('Error generating comments:', err);
        setError('Failed to generate comments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateComments();
  }, [cleanedResumeText, shouldGenerateReview]);

  const handleReReview = async () => {
    if (!cleanedResumeText) return;
    
    try {
      setIsReReviewing(true);
      setError(null);
      
      setShouldGenerateReview(true);
      
      const clearResponse = await fetch('/api/re-review-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: cleanedResumeText }),
      });

      if (!clearResponse.ok) {
        const errorData = await clearResponse.json();
        throw new Error(errorData.error || 'Failed to clear cache');
      }

      // Now regenerate comments (this will call OpenAI since cache is cleared)
      const response = await fetch('/api/assess-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume: cleanedResumeText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assess resume');
      }

      const data = await response.json();
      
      // Update cached status
      setIsCached(data.cached || false);
      
      if (data.comments && data.comments.length > 0) {
        // Process comments to find exact positions using reference text
        const processedComments = data.comments.map((comment: Comment, index: number) => {
          // Find exact position using reference text in CLEANED text
          let exactPosition = null;
          if (comment.reference_text) {
            exactPosition = findTextPosition(cleanedResumeText, comment.reference_text);
          }
          
          // If we found the exact position, use it; otherwise fall back to AI position
          const finalPosition = exactPosition || comment.position;
          
          return {
            ...comment,
            position: finalPosition
          };
        });
        
        setComments(processedComments);
      } else {
        setError('No comments were generated. Please try again.');
      }
    } catch (err) {
      console.error('Error re-reviewing resume:', err);
      setError('Failed to re-review resume. Please try again.');
    } finally {
      setIsReReviewing(false);
    }
  };

  /**
   * Sorts comments by their position in the document (top to bottom)
   */
  const getSortedComments = () => {
    return [...comments].sort((a, b) => {
      if (a.position && b.position && a.position.start !== undefined && b.position.start !== undefined) {
        return a.position.start - b.position.start;
      }
      
      if (a.position && a.position.start !== undefined) return -1;
      if (b.position && b.position.start !== undefined) return 1;
      
      return 0;
    });
  };

  /**
   * Downloads the current resume
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      const response = await fetch('/api/download-resume');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download resume');
      }
      
      const blob = await response.blob();
      
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; 
      
      const userName = session?.user?.name || 'user';
      const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      
      const filename = `${cleanUserName}_resume_${dateString}.txt`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading resume:', error);
      setError('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Applies the selected suggestions to the resume
   */
  const handleApplyChanges = async () => {
    if (!cleanedResumeText || comments.length === 0) return;
    
    try {
      setIsApplyingChanges(true);
      setError(null);
      
      // Get accepted suggestions
      const acceptedSuggestions = comments.filter(comment => comment.status === 'accepted');
      
      if (acceptedSuggestions.length === 0) {
        setError('Please accept at least one suggestion before applying changes.');
        return;
      }
      
      // Call API to apply changes
      const response = await fetch('/api/apply-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resume: cleanedResumeText,
          suggestions: acceptedSuggestions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply changes');
      }

      const data = await response.json();
      
      // Update the resume text with the modified version
      const updatedResumeText = data.updatedResume;
      const cleanedUpdatedText = cleanExcessiveNewlines(updatedResumeText, MAX_CONSECUTIVE_NEWLINES);
      
      setResumeText(updatedResumeText);
      setCleanedResumeText(cleanedUpdatedText);
      setHasAppliedChanges(true);
      
      // Clear comments since they've been applied
      setComments([]);
      setExpandedComments(new Set());
      
      // Prevent automatic re-reviewing after applying changes
      setShouldGenerateReview(false);
      
      console.log(`Successfully applied ${data.appliedSuggestions} suggestions to resume`);
      
    } catch (error) {
      console.error('Error applying changes:', error);
      setError('Failed to apply changes. Please try again.');
    } finally {
      setIsApplyingChanges(false);
    }
  };

  /**
   * Finds the exact position of reference text in the resume
   * Returns the start and end positions, or null if not found
   */
  function findTextPosition(resumeText: string, referenceText: string): { start: number; end: number } | null {
    if (!referenceText || !resumeText) {
      return null;
    }

    const searchStrategies = [
      () => {
        const index = resumeText.indexOf(referenceText);
        if (index !== -1) {
          return { start: index, end: index + referenceText.length };
        }
        return null;
      },
      
      () => {
        const cleanReference = referenceText.trim().replace(/\s+/g, ' ');
        const cleanResume = resumeText.replace(/\s+/g, ' ');
        const index = cleanResume.indexOf(cleanReference);
        if (index !== -1) {
          let originalIndex = 0;
          let cleanIndex = 0;
          
          while (cleanIndex < index && originalIndex < resumeText.length) {
            if (resumeText[originalIndex] === ' ' || 
                resumeText[originalIndex] === '\n' || 
                resumeText[originalIndex] === '\r' || 
                resumeText[originalIndex] === '\t') {
              while (originalIndex < resumeText.length && 
                     (resumeText[originalIndex] === ' ' || 
                      resumeText[originalIndex] === '\n' || 
                      resumeText[originalIndex] === '\r' || 
                      resumeText[originalIndex] === '\t')) {
                originalIndex++;
              }
              cleanIndex++;
            } else {
              originalIndex++;
              cleanIndex++;
            }
          }
          
          const start = originalIndex;
          
          let end = start;
          let refIndex = 0;
          
          while (refIndex < referenceText.length && end < resumeText.length) {
            if (referenceText[refIndex] === ' ' || 
                referenceText[refIndex] === '\n' || 
                referenceText[refIndex] === '\r' || 
                referenceText[refIndex] === '\t') {
              while (refIndex < referenceText.length && 
                     (referenceText[refIndex] === ' ' || 
                      referenceText[refIndex] === '\n' || 
                      referenceText[refIndex] === '\r' || 
                      referenceText[refIndex] === '\t')) {
                refIndex++;
              }
              while (end < resumeText.length && 
                     (resumeText[end] === ' ' || 
                      resumeText[end] === '\n' || 
                      resumeText[end] === '\r' || 
                      resumeText[end] === '\t')) {
                end++;
              }
            } else {
              end++;
              refIndex++;
            }
          }
          
          return { start, end };
        }
        return null;
      },
      
      () => {
        const lowerReference = referenceText.toLowerCase();
        const lowerResume = resumeText.toLowerCase();
        const index = lowerResume.indexOf(lowerReference);
        if (index !== -1) {
          return { start: index, end: index + referenceText.length };
        }
        return null;
      },
      
      () => {
        const referenceWords = referenceText.trim().split(/\s+/).filter(w => w.length > 0);
        if (referenceWords.length === 0) return null;
        
        const firstWord = referenceWords[0];
        const startIndex = resumeText.toLowerCase().indexOf(firstWord.toLowerCase());
        
        if (startIndex !== -1) {
          let currentIndex = startIndex + firstWord.length;
          let wordIndex = 1;
          
          while (wordIndex < referenceWords.length && currentIndex < resumeText.length) {
            while (currentIndex < resumeText.length && 
                   (resumeText[currentIndex] === ' ' || 
                    resumeText[currentIndex] === '\n' || 
                    resumeText[currentIndex] === '\r' || 
                    resumeText[currentIndex] === '\t')) {
              currentIndex++;
            }
            
            const nextWord = referenceWords[wordIndex];
            const nextWordIndex = resumeText.toLowerCase().indexOf(nextWord.toLowerCase(), currentIndex);
            
            if (nextWordIndex === currentIndex) {
              currentIndex = nextWordIndex + nextWord.length;
              wordIndex++;
            } else {
              break;
            }
          }
          
          if (wordIndex === referenceWords.length) {
            return { start: startIndex, end: currentIndex };
          }
        }
        return null;
      }
    ];

    for (let i = 0; i < searchStrategies.length; i++) {
      const result = searchStrategies[i]();
      if (result) {
        const { start, end } = result;
        const foundText = resumeText.substring(start, end);
        
        if (start >= 0 && end <= resumeText.length && start < end) {
          return result;
        } else {
          console.log(`Invalid position range: ${start}-${end} (resume length: ${resumeText.length})`);
        }
      }
    }

    console.log(`Reference text not found in any strategy: "${referenceText}"`);
    
    const words = referenceText.split(/\s+/).filter(w => w.length > 2);
    if (words.length > 0) {
      words.forEach(word => {
        const index = resumeText.toLowerCase().indexOf(word.toLowerCase());
        if (index !== -1) {
          const context = resumeText.substring(Math.max(0, index - 20), Math.min(resumeText.length, index + word.length + 20));
        }
      });
    }
    
    return null;
  }

  const handleCommentAction = (commentId: string, action: 'accept' | 'reject') => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, status: action === 'accept' ? 'accepted' : 'rejected' }
        : comment
    ));
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const dismissComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleHighlightClick = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(commentId)) {
        newSet.add(commentId);
      }
      return newSet;
    });
    
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsAsking(true);
    setTimeout(() => {
      console.log('Asking question:', userQuestion);
      setUserQuestion('');
      setIsAsking(false);
    }, 1000);
  };

  const getCategoryColor = (category: Comment['category']) => {
    switch (category) {
      case 'grammar': return 'bg-red-100 text-red-800 border-red-200';
      case 'content': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'formatting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suggestion': return 'bg-green-100 text-green-800 border-green-200';
      case 'clarity': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'word-choice': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Comment['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <AuthGuard requireSubscription={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex h-[calc(100vh-80px)]">
        {/* Document Viewer - 2/3 width */}
        <div className="w-2/3 bg-white border-r border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Document Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900">Resume Review</h1>
                {hasAppliedChanges && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Changes Applied
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  title="Download current resume"
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleApplyChanges}
                  disabled={isApplyingChanges || comments.filter(c => c.status === 'accepted').length === 0}
                  className="px-3 py-1.5 text-sm bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  title="Apply accepted suggestions to resume"
                >
                  {isApplyingChanges ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Apply Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <DocumentViewer 
                  content={cleanedResumeText}
                  highlights={comments.map(comment => ({
                    id: comment.id,
                    position: comment.position,
                    category: comment.category
                  }))}
                  onHighlightClick={handleHighlightClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Comments Panel - 1/3 width */}
        <div className="w-1/3 bg-white flex flex-col">
          {/* Comments Header */}
          <div className="px-6 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review Suggestions</h2>
                {isLoading ? (
                  <p className="text-sm text-gray-500">Generating suggestions...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {getSortedComments().filter(c => c.status === 'pending').length} pending suggestions
                    </p>
                  </div>
                )}
              </div>
              {!isLoading && !error && cleanedResumeText && (
                  <button
                    onClick={handleReReview}
                    disabled={isReReviewing}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Get fresh AI review (will use OpenAI tokens)"
                  >
                    {isReReviewing ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Re-reviewing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Re-review
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          {/* Comments List */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mfr-primary"></div>
                <span className="ml-3 text-gray-500">Analyzing resume...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {getSortedComments().map((comment) => (
                  <div
                    id={`comment-${comment.id}`}
                    key={comment.id}
                    className={`transition-all duration-200 ${
                      comment.status !== 'pending' ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Comment Header */}
                    <div 
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        comment.status === 'accepted' 
                          ? 'bg-green-50 border-l-4 border-green-400' 
                          : comment.status === 'rejected'
                          ? 'bg-red-50 border-l-4 border-red-400'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleCommentExpansion(comment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            comment.status === 'accepted'
                              ? 'bg-green-100'
                              : comment.status === 'rejected'
                              ? 'bg-red-100'
                              : comment.category === 'clarity' 
                              ? 'bg-blue-100' 
                              : 'bg-red-100'
                          }`}>
                            {comment.status === 'accepted' ? (
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : comment.status === 'rejected' ? (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : comment.category === 'clarity' ? (
                              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{comment.text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs font-medium uppercase tracking-wide ${
                                comment.status === 'accepted'
                                  ? 'text-green-600'
                                  : comment.status === 'rejected'
                                  ? 'text-red-600'
                                  : 'text-gray-500'
                              }`}>
                                {comment.status === 'accepted' 
                                  ? 'Accepted' 
                                  : comment.status === 'rejected'
                                  ? 'Rejected'
                                  : comment.category === 'clarity' 
                                  ? 'Clarity' 
                                  : 'Word Choice'
                                }
                              </span>
                              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <svg 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedComments.has(comment.id) ? 'rotate-180' : ''
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedComments.has(comment.id) && (
                      <div className="px-4 pb-3 bg-gray-50">
                        <p className="text-sm text-gray-700 mb-3 pt-2">{comment.why}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => dismissComment(comment.id)}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Dismiss
                          </button>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleCommentAction(comment.id, 'accept')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Accept suggestion"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCommentAction(comment.id, 'reject')}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Reject suggestion"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button className="p-1 text-gray-400 hover:bg-gray-200 rounded transition-colors">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Ask a follow-up question</span>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="Type your question or provide context..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mfr-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!userQuestion.trim() || isAsking}
                  className="px-4 py-2 bg-mfr-primary text-white text-sm rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAsking ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>Press Enter to send or click the microphone to speak</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
