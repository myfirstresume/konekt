'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ResumeMetadata {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  lastModified: string;
  status: 'pending' | 'reviewed' | 'archived';
  reviewCount: number;
  thumbnail?: string;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resume metadata
    const loadResumes = async () => {
      setIsLoading(true);
      
      // Mock data - in real app, this would come from your API
      const mockResumes: ResumeMetadata[] = [
        {
          id: '1',
          name: 'Sample Resume',
          fileName: 'sample_resume.docx',
          fileSize: '29KB',
          lastModified: new Date().toLocaleDateString(),
          status: 'reviewed',
          reviewCount: 3,
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setResumes(mockResumes);
        setIsLoading(false);
      }, 500);
    };

    loadResumes();
  }, []);

  const getStatusColor = (status: ResumeMetadata['status']) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: ResumeMetadata['status']) => {
    switch (status) {
      case 'reviewed':
        return 'Reviewed';
      case 'pending':
        return 'Pending Review';
      case 'archived':
        return 'Archived';
      default:
        return 'Unknown';
    }
  };

  const handleResumeClick = (resume: ResumeMetadata) => {
    // Navigate to review page with resume ID
    window.location.href = `/review?resumeId=${resume.id}`;
  };

  const handleUploadResume = () => {
    // TODO: Implement file upload functionality
    console.log('Upload resume clicked');
  };

  if (isLoading) {
    return (
      <AuthGuard requireSubscription={true}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resumes...</p>
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
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
                  <p className="text-lg text-gray-600 mt-2">
                    Select a resume to review and improve with AI
                  </p>
                </div>
                <button
                  onClick={handleUploadResume}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mfr-primary hover:bg-mfr-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mfr-primary"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Upload Resume
                </button>
              </div>
            </div>

            <div className="mb-16">
              {resumes.length === 0 ? (
                <div className="flex items-center justify-center py-32">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Upload your first resume to get started with AI-powered review.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={handleUploadResume}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mfr-primary hover:bg-mfr-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mfr-primary"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Upload Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => handleResumeClick(resume)}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* Resume Preview */}
                      <div className="mb-4">
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>

                      {/* Resume Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {resume.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {resume.fileName}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(resume.status)}`}>
                            {getStatusText(resume.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {resume.fileSize}
                          </span>
                        </div>

                        {/* Additional Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Last modified: {resume.lastModified}</span>
                          <span>{resume.reviewCount} reviews</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResumeClick(resume);
                            }}
                            className="flex-1 bg-mfr-primary text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-mfr-primary/80 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement download functionality
                              console.log('Download resume:', resume.id);
                            }}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional content to push footer down */}
            <div className="py-32">
              <div className="text-center text-gray-500 text-sm">
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}