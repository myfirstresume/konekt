'use client';

import { useState } from 'react';
import { InterviewCard as InterviewCardType } from '@/types/interview';
import Image from 'next/image';

interface InterviewCardProps {
  interviewer: InterviewCardType;
  onCreditUsed?: () => void;
}

export default function InterviewCard({ interviewer, onCreditUsed }: InterviewCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScheduleInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, consume a mock interview credit
      const creditResponse = await fetch('/api/use-mock-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!creditResponse.ok) {
        const errorData = await creditResponse.json();
        if (errorData.limitReached) {
          setError(errorData.error);
          return;
        }
        throw new Error(errorData.error || 'Failed to use mock interview credit');
      }

      const creditData = await creditResponse.json();
      
      if (creditData.success) {
        // Credit consumed successfully, now redirect to the signup link
        window.open(interviewer.signUpLink, '_blank', 'noopener,noreferrer');
        
        // Notify parent component to refresh usage
        if (onCreditUsed) {
          onCreditUsed();
        }
      } else {
        throw new Error('Failed to use mock interview credit');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule interview');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {interviewer.thumbnail ? (
            <Image
              src={interviewer.thumbnail}
              alt={`${interviewer.company} logo`}
              width={60}
              height={60}
              className="w-15 h-15 object-contain rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-15 h-15 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {interviewer.position}
            </h3>
            <p className="text-gray-600 text-sm">
              {interviewer.company}
            </p>
            <p className="text-gray-500 text-sm">
              {interviewer.tenure} year{interviewer.tenure !== 1 ? 's' : ''} of experience
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('limit') && (
                <a 
                  href="/pricing" 
                  className="text-red-600 hover:text-red-800 text-sm underline mt-1 inline-block"
                >
                  Upgrade your plan
                </a>
              )}
            </div>
          )}

          {/* Schedule button */}
          <button
            onClick={handleScheduleInterview}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-mfr-primary text-white text-sm font-medium rounded-md hover:bg-mfr-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Interview (1 credit)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
