'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InterviewCard from '@/components/InterviewCard';
import AuthGuard from '@/components/AuthGuard';
import { interviewers } from '@/data/interviewers';

interface UsageData {
  liveMocksUsed: number;
  liveMocksLimit: number;
  resumeReviewsUsed: number;
  resumeReviewsLimit: number;
  followUpQuestionsUsed: number;
  followUpQuestionsLimit: number;
  voiceNotesUsed: number;
  voiceNotesLimit: number;
}

export default function Mock() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const response = await fetch('/api/usage');
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Error loading usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsage();
  }, []);

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  return (
    <AuthGuard requireSubscription={true}>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Schedule a Mock Interview</h1>
              <p className="text-gray-600 mb-4">
                Practice with experienced interviewers from top companies
              </p>
              
              {/* Usage Information */}
              {!isLoading && usage && (
                <div className="bg-mfr-primary/10 border border-mfr-primary/20 rounded-lg p-3 mb-2 max-w-md mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-mfr-primary">
                        {usage.liveMocksLimit - usage.liveMocksUsed} of {usage.liveMocksLimit} mock interview credits remaining
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {usage.liveMocksUsed >= usage.liveMocksLimit ? (
                        <button
                          onClick={handleUpgrade}
                          className="px-3 py-1 text-xs bg-mfr-primary text-white rounded-md hover:bg-mfr-primary/80 transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-mfr-primary/20 rounded-full h-2">
                      <div 
                        className="bg-mfr-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usage.liveMocksUsed / usage.liveMocksLimit) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {!isLoading && usage && usage.liveMocksUsed >= usage.liveMocksLimit && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-orange-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-orange-800">No credits remaining</h3>
                      <p className="text-sm text-orange-700">
                        Upgrade your plan to get more mock interview credits
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-76">
              {interviewers.map((interviewer) => (
                <InterviewCard 
                  key={interviewer.id} 
                  interviewer={interviewer} 
                  onCreditUsed={() => {
                    // Refresh usage data after credit is consumed
                    const loadUsage = async () => {
                      try {
                        const response = await fetch('/api/usage');
                        if (response.ok) {
                          const data = await response.json();
                          setUsage(data);
                        }
                      } catch (error) {
                        console.error('Error refreshing usage:', error);
                      }
                    };
                    loadUsage();
                  }}
                />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
