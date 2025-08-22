'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DocumentViewer from '@/components/DocumentViewer';
import ChatMessage from '@/components/ChatMessage';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { textToDocx } from '@/utils/document-generator';
import { saveSuggestionsToCache, getCachedSuggestions, updateSuggestionStatus, cleanupHandledSuggestions } from '@/utils/suggestion-cache';

interface Comment {
  id: string;
  text: string;
  why: string;
  status: 'pending' | 'accepted' | 'rejected';
  position: { start: number; end: number };
  category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
  reference_text?: string;
}

function ReviewPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  
  // Type assertion for session to ensure user.id is available
  const typedSession = session as any;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [cleanedResumeText, setCleanedResumeText] = useState<string>('');
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isReReviewing, setIsReReviewing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);
  const [isApplyingChatChanges, setIsApplyingChatChanges] = useState(false);
  const [hasAppliedChanges, setHasAppliedChanges] = useState(false);
  const [shouldGenerateReview, setShouldGenerateReview] = useState(true);
  const [downloadFormat, setDownloadFormat] = useState<'docx' | 'pdf'>('docx');
  const [currentResumeVersion, setCurrentResumeVersion] = useState<string>('original');
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    filename: string;
    originalName: string;
    blobUrl: string;
    fileType: string;
  } | null>(null);
  const [usage, setUsage] = useState<{
    resumeReviewsUsed: number;
    resumeReviewsLimit: number;
    followUpQuestionsUsed: number;
    followUpQuestionsLimit: number;
    voiceNotesUsed: number;
    voiceNotesLimit: number;
    liveMocksUsed: number;
    liveMocksLimit: number;
  } | null>(null);

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
    const loadResumeData = async () => {
      if (!resumeId) {
        setError('No resume ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // First, get the file information from the database
        const fileResponse = await fetch(`/api/uploaded-files`);
        if (!fileResponse.ok) {
          throw new Error('Failed to load uploaded files');
        }

        const fileData = await fileResponse.json();
        const targetFile = fileData.files.find((file: { id: string }) => file.id === resumeId);
        
        if (!targetFile) {
          throw new Error('Resume not found');
        }

        setSelectedFile(targetFile);

        // Parse the file content using our parsing API
        const parseResponse = await fetch('/api/parse-resume-blob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blobUrl: targetFile.blobUrl,
            fileType: targetFile.fileType
          }),
        });

        if (!parseResponse.ok) {
          const errorData = await parseResponse.json();
          throw new Error(errorData.error || 'Failed to parse resume content');
        }

        const parseData = await parseResponse.json();
        const resumeContent = parseData.text;

        const cleanedText = cleanExcessiveNewlines(resumeContent, MAX_CONSECUTIVE_NEWLINES);
        
        // Check if there's a latest version of this resume
        const versionResponse = await fetch(`/api/get-latest-resume-version?originalFileId=${targetFile.id}`);
        let latestVersion: {
          id: string;
          versionName: string;
          resumeContent: string;
          blobUrl: string;
          appliedSuggestions?: any;
          createdAt: string;
        } | null = null;
        
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          latestVersion = versionData.version;
        }
        
        if (latestVersion) {
          // Use the latest version instead of the original
          const versionCleanedText = cleanExcessiveNewlines(latestVersion.resumeContent, MAX_CONSECUTIVE_NEWLINES);
          setResumeText(latestVersion.resumeContent);
          setCleanedResumeText(versionCleanedText);
          setCurrentResumeVersion(latestVersion.versionName);
        } else {
          // Use the original content
          setResumeText(resumeContent);
          setCleanedResumeText(cleanedText);
          setCurrentResumeVersion('original');
        }
        
        // Check if there are any existing reviews for this resume
        // If not, automatically start a review
        const reviewResponse = await fetch('/api/assess-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ resume: latestVersion ? latestVersion.resumeContent : cleanedText }),
        });

        if (reviewResponse.ok) {
          const reviewData = await reviewResponse.json();
          if (reviewData.comments && reviewData.comments.length > 0) {
            // There are existing comments, don't auto-review
            setShouldGenerateReview(false);
            setIsCached(reviewData.cached || false);
            
            // Process comments to find exact positions
            const processedComments = reviewData.comments.map((comment: Comment) => {
              let exactPosition: { start: number; end: number } | null = null;
              if (comment.reference_text) {
                exactPosition = findTextPosition(cleanedText, comment.reference_text);
              }
              const finalPosition = exactPosition || comment.position;
              return { ...comment, position: finalPosition };
            });
            
            setComments(processedComments);
          } else {
            // Check for cached suggestions
            try {
              const resumeHash = btoa(cleanedText).slice(0, 32);
              const cachedSuggestions = await getCachedSuggestions(typedSession.user?.id || '', resumeHash);
              
              if (cachedSuggestions.length > 0) {
                // Use cached suggestions
                setShouldGenerateReview(false);
                setIsCached(true);
                setComments(cachedSuggestions);
              } else {
                // No cached suggestions, start a fresh review
                setShouldGenerateReview(true);
              }
            } catch (error) {
              console.error('Error loading cached suggestions:', error);
              setShouldGenerateReview(true);
            }
          }
        } else {
          // If review check fails, check for cached suggestions
          try {
            const resumeHash = btoa(cleanedText).slice(0, 32);
            const cachedSuggestions = await getCachedSuggestions(typedSession.user?.id || '', resumeHash);
            
            if (cachedSuggestions.length > 0) {
              setShouldGenerateReview(false);
              setIsCached(true);
              setComments(cachedSuggestions);
            } else {
              setShouldGenerateReview(true);
            }
          } catch (error) {
            console.error('Error loading cached suggestions:', error);
            setShouldGenerateReview(true);
          }
        }

      } catch (error) {
        console.error('Error loading resume:', error);
        setError(`Failed to load resume: ${error}`);
        setIsLoading(false);
      }
    };

    const loadChatMessages = async () => {
      try {
        const response = await fetch('/api/chat-messages');
        if (response.ok) {
          const data = await response.json();
          setChatMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error loading chat messages:', error);
      }
    };

    loadResumeData();
    loadUsage();
    loadChatMessages();
  }, [resumeId]);

  const loadUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const handleUpgrade = () => {
    // Navigate to pricing page
    window.location.href = '/pricing';
  };

  useEffect(() => {
    const generateComments = async () => {
      if (!cleanedResumeText) return;
      
      // If shouldGenerateReview is false, just show no changes
      if (!shouldGenerateReview) {
        setComments([]);
        setIsCached(false);
        setIsLoading(false);
        return;
      }
      
      // Original logic for generating new comments
      if (!shouldGenerateReview) return;
      
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
            let exactPosition: { start: number; end: number } | null = null;
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
          
          // Save suggestions to cache
          try {
            const resumeHash = btoa(cleanedResumeText).slice(0, 32); // Simple hash for demo
            await saveSuggestionsToCache(typedSession.user?.id || '', resumeHash, processedComments);
          } catch (error) {
            console.error('Error saving suggestions to cache:', error);
          }
          
          // Refresh usage data after generating new review
          if (!data.cached) {
            loadUsage();
          }
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
    
    // Check if user has reached their limit
    if (usage && usage.resumeReviewsUsed >= usage.resumeReviewsLimit) {
      setError('You have reached your monthly review limit. Please upgrade your plan to continue.');
      return;
    }
    
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
          let exactPosition: { start: number; end: number } | null = null;
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
    if (!selectedFile) {
      setError('No file selected for download');
      return;
    }


    
          try {
        setIsDownloading(true);
        setError(null); // Clear any previous errors
        
        // Get the latest version if available, otherwise use the original file
        let downloadUrl = selectedFile.blobUrl;
        
        if (currentResumeVersion !== 'original') {
          const versionResponse = await fetch(`/api/get-latest-resume-version?originalFileId=${selectedFile.id}`);
          if (versionResponse.ok) {
            const versionData = await versionResponse.json();
            if (versionData.version) {
              downloadUrl = versionData.version.blobUrl;
            }
          }
        }
        
        // Fetch the file from the blob URL
        const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; 
      
      const userName = session?.user?.name || 'user';
      const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      
      // Create standardized filename
      const filename = `${cleanUserName}_resume_${dateString}_v${currentResumeVersion === 'original' ? '1' : 'latest'}.docx`;
      
      // Convert text to DOCX format
      const docxBuffer = await textToDocx(resumeText);
      const docxBlob = new Blob([new Uint8Array(docxBuffer)], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
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
    if (!cleanedResumeText || comments.length === 0 || !selectedFile) return;
    
    try {
      setIsApplyingChanges(true);
      setError(null);
      
      // Get accepted suggestions
      const acceptedSuggestions = comments.filter(comment => comment.status === 'accepted');
      
      if (acceptedSuggestions.length === 0) {
        setError('Please accept at least one suggestion before applying changes. Click the green checkmark next to suggestions you want to apply.');
        setIsApplyingChanges(false);
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
      
      // Save the new version to blob store
      const versionResponse = await fetch('/api/save-resume-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: updatedResumeText,
          versionName: `After AI Review (${acceptedSuggestions.length} changes)`,
          originalFileId: selectedFile.id,
          appliedSuggestions: acceptedSuggestions
        }),
      });

      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        setCurrentResumeVersion(versionData.version.versionName);
        console.log('New version saved:', versionData.version.versionName);
      } else {
        console.warn('Failed to save version, but changes were applied');
      }
      
      // Keep only pending suggestions, remove accepted ones
      setComments(prev => prev.filter(comment => comment.status === 'pending'));
      setExpandedComments(new Set());
      
      // Clean up handled suggestions from database
      try {
        await cleanupHandledSuggestions(typedSession.user?.id || '', 'resume-hash'); // You'll need to generate proper hash
      } catch (error) {
        console.error('Error cleaning up handled suggestions:', error);
      }
      
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

  const handleApplyChatChanges = async () => {
    if (!cleanedResumeText || chatMessages.length === 0 || !selectedFile) return;
    
    try {
      setIsApplyingChatChanges(true);
      setError(null);
      
      // Call API to apply chat-based changes
      const response = await fetch('/api/apply-chat-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          resume: cleanedResumeText,
          chatMessages: chatMessages,
          comments: comments,
          selectedCommentId: selectedCommentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply chat changes');
      }

      const data = await response.json();
      
      // Update the resume text with the modified version
      const updatedResumeText = data.updatedResume;
      const cleanedUpdatedText = cleanExcessiveNewlines(updatedResumeText, MAX_CONSECUTIVE_NEWLINES);
      
      setResumeText(updatedResumeText);
      setCleanedResumeText(cleanedUpdatedText);
      setHasAppliedChanges(true);
      
      // Save the new version to blob store
      const versionResponse = await fetch('/api/save-resume-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeContent: updatedResumeText,
          versionName: `After Chat Improvements`,
          originalFileId: selectedFile.id,
          appliedSuggestions: null
        }),
      });

      if (versionResponse.ok) {
        const versionData = await versionResponse.json();
        setCurrentResumeVersion(versionData.version.versionName);
        console.log('New version saved:', versionData.version.versionName);
      } else {
        console.warn('Failed to save version, but changes were applied');
      }
      
      // Clear chat messages from database since they've been applied
      try {
        await fetch('/api/chat-messages', {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error clearing chat messages:', error);
      }
      
      setChatMessages([]);
      setSelectedCommentId(null);
      
      // Prevent automatic re-reviewing after applying changes
      setShouldGenerateReview(false);
      
      console.log(`Successfully applied chat-based improvements to resume`);
      
    } catch (error) {
      console.error('Error applying chat changes:', error);
      setError('Failed to apply chat changes. Please try again.');
    } finally {
      setIsApplyingChatChanges(false);
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

  const handleCommentAction = async (commentId: string, action: 'accept' | 'reject') => {
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    
    // Update local state
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, status: newStatus }
        : comment
    ));
    
    // Update in database
    try {
      await updateSuggestionStatus(commentId, newStatus);
    } catch (error) {
      console.error('Error updating suggestion status:', error);
    }
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

  const handleCommentSelect = (commentId: string) => {
    setSelectedCommentId(commentId === selectedCommentId ? null : commentId);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    // Check if user has reached their limit
    if (usage && usage.followUpQuestionsUsed >= usage.followUpQuestionsLimit) {
      setError('You have reached your monthly follow-up question limit. Please upgrade your plan to continue.');
      return;
    }
    
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuestion,
      timestamp: new Date(),
      relatedCommentId: selectedCommentId || undefined
    };
    
    // Save user message to database
    try {
      const saveResponse = await fetch('/api/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'user',
          content: userQuestion,
          relatedCommentId: selectedCommentId || null
        }),
      });

      if (saveResponse.ok) {
        const savedMessage = await saveResponse.json();
        userMessage.id = savedMessage.id;
      }
    } catch (error) {
      console.error('Error saving user message:', error);
    }
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserQuestion('');
    setIsAsking(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuestion,
          resumeText: cleanedResumeText,
          comments: comments,
          relatedCommentId: selectedCommentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          setError(errorData.error);
          // Remove the user message since it wasn't processed
          setChatMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        } else {
          throw new Error(errorData.error || 'Failed to send message');
        }
        return;
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Update usage
      if (data.usage) {
        setUsage(prev => prev ? {
          ...prev,
          followUpQuestionsUsed: data.usage.followUpQuestionsUsed,
          followUpQuestionsLimit: data.usage.followUpQuestionsLimit
        } : null);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      // Remove the user message since it failed
      setChatMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsAsking(false);
    }
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

  // Loading state
  if (isLoading) {
    return (
      <AuthGuard requireSubscription={true}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
              <p className="text-gray-600">
                {shouldGenerateReview ? 'Reviewing resume...' : 'Loading resume...'}
              </p>
              {shouldGenerateReview && (
                <p className="text-sm text-gray-500 mt-2">This may take a moments</p>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  // Error state for no resume ID
  if (!resumeId) {
    return (
      <AuthGuard requireSubscription={true}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">No Resume Selected</h3>
                <p className="text-red-700 mb-4">Please select a resume to review from your dashboard.</p>
                <a
                  href="/resumes"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Go to Resumes
                </a>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  // Error state for loading errors
  if (error) {
    return (
      <AuthGuard requireSubscription={true}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Resume</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <a
                    href="/resumes"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Go to Resumes
                  </a>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireSubscription={true}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Document Viewer - Full width on mobile, 2/3 on desktop */}
        <div className="w-full lg:w-2/3 bg-white lg:border-r border-gray-200 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Resume Review</h1>
                  {selectedFile && (
                    <p className="text-sm text-gray-500 mt-1">{selectedFile.originalName}</p>
                  )}
                </div>
                {hasAppliedChanges && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Changes Applied
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-md text-gray-600 font-medium">
                    DOCX
                  </span>
                  <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title={`Download current resume as ${downloadFormat.toUpperCase()}`}
                  >
                    {isDownloading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">Download</span>
                      </>
                    )}
                  </button>
                </div>
                <button 
                  onClick={handleApplyChanges}
                  disabled={isApplyingChanges || comments.length === 0}
                  className="px-3 py-1.5 text-sm bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                  title="Apply accepted suggestions to resume"
                >
                  {isApplyingChanges ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Applying...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Apply Changes</span>
                    </>
                  )}
                </button>
                {chatMessages.length > 0 && (
                  <button 
                    onClick={handleApplyChatChanges}
                    disabled={isApplyingChatChanges}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    title="Apply improvements from chat conversation"
                  >
                    {isApplyingChatChanges ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Applying Chat Changes...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="hidden sm:inline">Apply Chat Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
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

        {/* Comments Panel - Full width on mobile, 1/3 on desktop */}
        <div className="w-full lg:w-1/3 bg-white flex flex-col border-t lg:border-t-0 border-gray-200">
          {/* Comments Header */}
          <div className="px-4 sm:px-6 py-2 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review Suggestions</h2>
                {isLoading ? (
                  <p className="text-sm text-gray-500">Generating suggestions...</p>
                ) : error ? (
                  <p className="text-sm text-red-500">{error}</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {getSortedComments().filter(c => c.status === 'pending').length} pending suggestions
                    </p>
                    {currentResumeVersion !== 'original' && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {currentResumeVersion}
                      </span>
                    )}
                    {usage && (
                      <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                        Reviews: {usage.resumeReviewsUsed}/{usage.resumeReviewsLimit}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {!isLoading && !error && cleanedResumeText && (
                  <button
                    onClick={handleReReview}
                    disabled={isReReviewing || (usage ? usage.resumeReviewsUsed >= usage.resumeReviewsLimit : false)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={usage && usage.resumeReviewsUsed >= usage.resumeReviewsLimit ? "Monthly review limit reached. Please upgrade your plan." : "Get fresh AI review (will use OpenAI tokens)"}
                  >
                    {isReReviewing ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Re-reviewing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="hidden sm:inline">Re-review</span>
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
                  {error.includes('monthly review limit') ? (
                    <button 
                      onClick={handleUpgrade}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Upgrade Plan
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            ) : getSortedComments().length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  {/*                   <p className="text-gray-500 mb-2">
                    {currentResumeVersion !== 'original' 
                      ? `No cached suggestions available for ${currentResumeVersion}. Click "Re-review" to get fresh feedback.`
                      : 'No cached suggestions available. Click "Re-review" to get fresh feedback.'
                    }
                  </p>
                  {usage && usage.resumeReviewsUsed >= usage.resumeReviewsLimit ? (
                    <div className="space-y-2">
                      <p className="text-orange-600 text-sm">You've reached your monthly review limit.</p>
                      <button 
                        onClick={handleUpgrade}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Upgrade Plan
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleReReview}
                      disabled={isReReviewing}
                      className="px-4 py-2 bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isReReviewing ? 'Re-reviewing...' : 'Re-review'}
                    </button>
                  )} */}
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
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{comment.text}</p>
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
                          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
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
                              onClick={() => handleCommentSelect(comment.id)}
                              className={`p-1 rounded transition-colors ${
                                selectedCommentId === comment.id
                                  ? 'text-mfr-primary bg-mfr-primary/10'
                                  : 'text-gray-400 hover:bg-gray-200'
                              }`}
                              title={selectedCommentId === comment.id ? 'Deselect for chat' : 'Select for chat context'}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                            </button>
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="border-t border-gray-200 flex flex-col h-80">
            {/* Chat Header */}
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Chat with AI</span>
                  {selectedCommentId && (
                    <span className="text-xs text-white bg-mfr-primary px-2 py-1 rounded-full">
                      Context selected
                    </span>
                  )}
                </div>
                {usage && (
                  <span className="text-xs text-gray-500">
                    {usage.followUpQuestionsUsed}/{usage.followUpQuestionsLimit} questions
                  </span>
                )}
                {chatMessages.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/chat-messages', { method: 'DELETE' });
                        setChatMessages([]);
                        setSelectedCommentId(null);
                      } catch (error) {
                        console.error('Error clearing chat:', error);
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    title="Clear all chat messages"
                  >
                    Clear Chat
                  </button>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-900 text-sm py-8">
                  <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-900">Ask questions about your resume suggestions</p>
                  <p className="text-xs mt-1 text-gray-600">Select a comment above for specific context</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
                             {isAsking && (
                 <div className="flex justify-start mb-4">
                   <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                     <div className="flex items-center space-x-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                       <span className="text-sm text-gray-900">Updating memory...</span>
                     </div>
                   </div>
                 </div>
               )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder={selectedCommentId ? "Ask about the selected suggestion..." : "Ask a question about your resume..."}
                  className="flex-1 px-3 py-2 text-sm border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mfr-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                  disabled={isAsking || (usage ? usage.followUpQuestionsUsed >= usage.followUpQuestionsLimit : false)}
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!userQuestion.trim() || isAsking || (usage ? usage.followUpQuestionsUsed >= usage.followUpQuestionsLimit : false)}
                  className="px-3 py-2 bg-mfr-primary text-white text-sm rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                             {usage && usage.followUpQuestionsUsed >= usage.followUpQuestionsLimit && (
                 <p className="text-xs text-red-500 mt-2">
                   You&apos;ve reached your monthly question limit. <button onClick={handleUpgrade} className="text-blue-600 hover:underline">Upgrade your plan</button> to continue.
                 </p>
               )}
            </div>
          </div>
        </div>
      </main>


      </div>
    </AuthGuard>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mfr-primary"></div>
        </main>
        <Footer />
      </div>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}
