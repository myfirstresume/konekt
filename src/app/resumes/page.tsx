'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadBox from '@/components/UploadBox';
import { useUploadedFiles } from '@/hooks/useUploadedFiles';

interface ResumeMetadata {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  lastModified: string;
  status: 'pending' | 'reviewed' | 'archived';
  reviewCount: number;
  thumbnail?: string;
  blobUrl: string;
}

export default function ResumesPage() {
  const { files: uploadedFiles, isLoading, error, refetch } = useUploadedFiles();
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // Convert uploaded files to resume metadata format
    const convertedResumes: ResumeMetadata[] = uploadedFiles.map(file => ({
      id: file.id,
      name: file.originalName,
      fileName: file.filename,
      fileSize: formatFileSize(file.fileSize),
      lastModified: formatDate(file.updatedAt),
      status: file.processingStatus === 'completed' ? 'reviewed' : 
              file.processingStatus === 'failed' ? 'archived' : 'pending',
      reviewCount: 0, // TODO: Get actual review count from database
      blobUrl: file.blobUrl
    }));

    setResumes(convertedResumes);
  }, [uploadedFiles]);

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
      day: 'numeric'
    });
  };

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

  const handleUploadSuccess = (fileUrl: string, filename: string, fileId: string) => {
    // Refresh the file list after successful upload
    refetch();
    // Close the modal after successful upload
    setShowUploadModal(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  if (isLoading) {
    return (
      <AuthGuard requireSubscription={true}>
        <div className="min-h-screen">
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
      <div className="min-h-screen">
        <Header />
        
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
                  <p className="text-lg text-gray-600 mt-2">
                    {resumes.length === 0 ? 'Upload a resume to get started' : 'Select a resume to review'}
                  </p>
                </div>
                {resumes.length > 0 && (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-mfr-primary hover:bg-mfr-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mfr-primary"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Upload
                  </button>
                )}
              </div>
            </div>

            <div className="mb-16">
              {error ? (
                <div className="flex items-center justify-center py-32">
                  <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Resumes</h3>
                      <p className="text-red-700 mb-4">{error}</p>
                      <button
                        onClick={() => refetch()}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="flex items-center justify-center py-32">
                  <div className="w-full max-w-2xl">
                    <UploadBox 
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                    />
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
                          <a
                            href={resume.blobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
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
        
        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative">
              {/* Close Button */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Modal Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Resume</h2>
                <p className="text-gray-600 mt-2">Upload your resume to get started</p>
              </div>
              
              {/* UploadBox Component */}
              <UploadBox 
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          </div>
        )}
        
        <Footer />
      </div>
    </AuthGuard>
  );
}