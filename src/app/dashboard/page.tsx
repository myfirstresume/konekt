'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createCustomerPortalSession } from "@/app/actions/stripe";
import { useAuth } from "@/hooks/useAuth";
import { useUploadedFiles } from "@/hooks/useUploadedFiles";
import Link from 'next/link';

interface SubscriptionData {
  planName: string;
  status: string;
  currentPeriodEnd: string;
  usage: {
    resumeReviewsUsed: number;
    resumeReviewsLimit: number;
    followUpQuestionsUsed: number;
    followUpQuestionsLimit: number;
    voiceNotesUsed: number;
    voiceNotesLimit: number;
    liveMocksUsed: number;
    liveMocksLimit: number;
  };
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoading: authLoading } = useAuth(true); // Require authentication
  const { files: uploadedFiles, isLoading: filesLoading, error: filesError } = useUploadedFiles();

  useEffect(() => {
    if (!userId) return;

    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/subscription?userId=${userId}`);
        const data = await response.json();
        
        if (data.subscription) {
          setSubscription(data.subscription);
        } else {
          setSubscription(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId]);

  const handleManageSubscription = async () => {
    if (!userId) return;
    
    setIsPortalLoading(true);
    try {
      const { url } = await createCustomerPortalSession(userId);
      if (url) {
        window.location.href = url;
      }
    } catch {
      console.error('Error creating portal session:', error);
      alert('There was an error accessing your billing portal. Please try again.');
    } finally {
      setIsPortalLoading(false);
    }
  };

  // TODO: Implement cancel subscription
  // const handleCancelSubscription = async () => {
  //   if (!userId || !subscription) return;
    
  //   const confirmed = window.confirm(
  //     'Are you sure you want to cancel your subscription? You&apos;ll continue to have access until the end of your current billing period.'
  //   );
    
  //   if (!confirmed) return;
    
  //   setIsCanceling(true);
  //   try {
  //     const response = await fetch(`/api/cancel-subscription?userId=${userId}`, {
  //       method: 'POST',
  //     });
      
  //     const data = await response.json();
      
  //     if (data.success) {
  //       // Refresh subscription data
  //       const subscriptionResponse = await fetch(`/api/subscription?userId=${userId}`);
  //       const subscriptionData = await subscriptionResponse.json();
        
  //       if (subscriptionData.subscription) {
  //         setSubscription(subscriptionData.subscription);
  //       }
        
  //       alert('Your subscription has been canceled successfully. You&apos;ll continue to have access until the end of your current billing period.');
  //     } else {
  //       alert('There was an error canceling your subscription. Please try again.');
  //     }
  //   } catch (error) {
  //     console.error('Error canceling subscription:', error);
  //     alert('There was an error canceling your subscription. Please try again.');
  //   } finally {
  //     setIsCanceling(false);
  //   }
  // };



  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your subscription and track your usage
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {subscription ? (
            <div className="space-y-8">
              {/* Subscription Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Subscription Status
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleManageSubscription}
                      disabled={isPortalLoading}
                      className="bg-mfr-primary text-white px-4 py-2 rounded-md hover:bg-mfr-primary/80 disabled:opacity-50"
                    >
                      {isPortalLoading ? 'Loading...' : 'Manage Billing'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-semibold text-gray-900">{subscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : subscription.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {subscription.status === 'canceled' ? 'Access Until' : 'Next Billing'}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>

                {/* Canceled Subscription Information */}
                {subscription.status === 'canceled' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Subscription Canceled
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p className="mb-2">
                            Your subscription has been cancelled. You will have access until {formatDate(subscription.currentPeriodEnd)}.
                          </p>
                        </div>
                        <div className="mt-3 flex space-x-3">
                          <button
                            onClick={handleManageSubscription}
                            disabled={isPortalLoading}
                            className="text-yellow-800 hover:text-yellow-900 underline text-sm font-medium"
                          >
                            Reactivate subscription
                          </button>
                          <Link
                            href="/pricing"
                            className="text-yellow-800 hover:text-yellow-900 underline text-sm font-medium"
                          >
                            View plans
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Tracking */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Usage This Month
                </h2>
                
                <div className="space-y-6">
                  {/* Resume Reviews */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Resume Reviews</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.resumeReviewsUsed} / {subscription.usage.resumeReviewsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mfr-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(subscription.usage.resumeReviewsUsed, subscription.usage.resumeReviewsLimit)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Follow-up Questions */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Follow-up Questions</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.followUpQuestionsUsed} / {subscription.usage.followUpQuestionsLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mfr-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(subscription.usage.followUpQuestionsUsed, subscription.usage.followUpQuestionsLimit)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Voice Notes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Voice Notes</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.voiceNotesUsed} / {subscription.usage.voiceNotesLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mfr-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(subscription.usage.voiceNotesUsed, subscription.usage.voiceNotesLimit)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Live Mocks */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Live Mock Interviews</span>
                      <span className="text-sm text-gray-500">
                        {subscription.usage.liveMocksUsed} / {subscription.usage.liveMocksLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mfr-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsagePercentage(subscription.usage.liveMocksUsed, subscription.usage.liveMocksLimit)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Uploaded Files
                </h2>
                
                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mfr-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your files...</p>
                  </div>
                ) : filesError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{filesError}</p>
                      </div>
                    </div>
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first resume to get started</p>
                    <Link
                      href="/resumes"
                      className="bg-mfr-primary text-white px-4 py-2 rounded-md hover:bg-mfr-primary/80"
                    >
                      Upload Resume
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{file.originalName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(file.createdAt)}</span>
                              <span>•</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                file.processingStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : file.processingStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {file.processingStatus || 'pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={file.blobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mfr-primary hover:text-mfr-primary/80 text-sm font-medium"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  No Active Subscription
                </h2>
                <p className="text-gray-600 mb-6">
                  You don&apos;t have an active subscription. Choose a plan to get started.
                </p>
                <Link
                  href="/pricing"
                  className="bg-mfr-primary text-white px-6 py-3 rounded-md hover:bg-mfr-primary/80"
                >
                  View Plans
                </Link>
              </div>

              {/* Uploaded Files */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Uploaded Files
                </h2>
                
                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mfr-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your files...</p>
                  </div>
                ) : filesError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{filesError}</p>
                      </div>
                    </div>
                  </div>
                ) : uploadedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first resume to get started</p>
                    <Link
                      href="/resumes"
                      className="bg-mfr-primary text-white px-4 py-2 rounded-md hover:bg-mfr-primary/80"
                    >
                      Upload Resume
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{file.originalName}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatFileSize(file.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(file.createdAt)}</span>
                              <span>•</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                file.processingStatus === 'completed' 
                                  ? 'bg-green-100 text-green-800'
                                  : file.processingStatus === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {file.processingStatus || 'pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={file.blobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-mfr-primary hover:text-mfr-primary/80 text-sm font-medium"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
