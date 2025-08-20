'use client';

import { useState } from 'react';
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
}

export default function ReviewPage() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      text: 'Rewrite the sentence',
      why: 'It may be unclear who or what "This" refers to. Consider rewriting the sentence to remove the unclear reference.',
      status: 'pending',
      position: { start: 150, end: 200 },
      category: 'clarity'
    },
    {
      id: '2',
      text: 'Use the right word',
      why: 'Consider using "analyses" instead of "analysis" for better precision in this context.',
      status: 'pending',
      position: { start: 300, end: 350 },
      category: 'word-choice'
    },
    {
      id: '3',
      text: 'Use the right word',
      why: 'Consider using "focussed" instead of "focused" for consistency with British English spelling.',
      status: 'pending',
      position: { start: 450, end: 500 },
      category: 'word-choice'
    },
    {
      id: '4',
      text: 'Use the right word',
      why: 'Consider using "Defense" instead of "defense" to match the proper noun capitalization.',
      status: 'pending',
      position: { start: 550, end: 600 },
      category: 'word-choice'
    },
    {
      id: '5',
      text: 'Correct word choice',
      why: 'Consider using "evidenced" instead of "evidence" for better grammatical flow.',
      status: 'pending',
      position: { start: 650, end: 700 },
      category: 'word-choice'
    }
  ]);

  const [userQuestion, setUserQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

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
    // Expand the corresponding comment when highlight is clicked
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(commentId)) {
        newSet.add(commentId);
      }
      return newSet;
    });
    
    // Scroll to the comment in the suggestions panel
    const commentElement = document.getElementById(`comment-${commentId}`);
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAskQuestion = async () => {
    if (!userQuestion.trim()) return;
    
    setIsAsking(true);
    // Simulate AI response
    setTimeout(() => {
      // Here you would typically make an API call to your AI service
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
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Resume Review</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  Download
                </button>
                <button className="px-3 py-1.5 text-sm bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 transition-colors">
                  Apply Changes
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-4xl mx-auto">
                <DocumentViewer 
                  documentPath="/data/sample_resume.docx"
                  highlights={comments.map(comment => ({
                    id: comment.id,
                    text: comment.text,
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
            <h2 className="text-lg font-semibold text-gray-900">Review Suggestions</h2>
            <p className="text-sm text-gray-500">
              {comments.filter(c => c.status === 'pending').length} pending suggestions
            </p>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <div
                  id={`comment-${comment.id}`}
                  key={comment.id}
                  className={`transition-all duration-200 ${
                    comment.status !== 'pending' ? 'opacity-75' : ''
                  }`}
                >
                  {/* Comment Header */}
                  <div 
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCommentExpansion(comment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          comment.category === 'clarity' ? 'bg-blue-100' : 'bg-red-100'
                        }`}>
                          {comment.category === 'clarity' ? (
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
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {comment.category === 'clarity' ? 'Clarity' : 'Word Choice'}
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
                      <p className="text-sm text-gray-700 mb-3">{comment.why}</p>
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
