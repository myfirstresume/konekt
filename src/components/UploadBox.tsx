'use client';

import { useState, useRef, useCallback } from "react";

interface UploadBoxProps {
  onUploadSuccess?: (fileUrl: string, filename: string) => void;
  onUploadError?: (error: string) => void;
}

export default function UploadBox({ onUploadSuccess, onUploadError }: UploadBoxProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          type: 'success',
          message: `Successfully uploaded ${file.name}! Your resume is being processed.`
        });
        
        // Call success callback if provided
        if (onUploadSuccess) {
          onUploadSuccess(result.url, file.name);
        }
      } else {
        const errorMessage = result.error || 'Upload failed. Please try again.';
        setUploadStatus({
          type: 'error',
          message: errorMessage
        });
        
        // Call error callback if provided
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.';
      setUploadStatus({
        type: 'error',
        message: errorMessage
      });
      
      // Call error callback if provided
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-auto text-center">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 sm:p-12 lg:p-16 text-center cursor-pointer transition-all duration-200 group min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] flex flex-col items-center justify-center ${
          isDragOver 
            ? 'border-mfr-primary bg-mfr-primary/10' 
            : 'border-gray-300 hover:border-mfr-primary hover:bg-mfr-primary/10'
        } ${isUploading ? 'pointer-events-none opacity-75' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3 sm:space-y-4">
          {/* Upload Icon */}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center transition-colors duration-200 ${
            isDragOver || isUploading
              ? 'bg-mfr-primary'
              : 'bg-gray-200 group-hover:bg-mfr-primary'
          }`}>
            {isUploading ? (
              <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg 
                className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 transition-colors duration-200 ${
                  isDragOver ? 'text-white' : 'text-gray-600 group-hover:text-white'
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            )}
          </div>
          
          <h2 className="text-lg sm:text-xl lg:text-xl font-semibold text-gray-900">
            {isUploading ? 'Uploading...' : 'Drop resume here'}
          </h2>
          
          <p className="text-gray-500 text-xs sm:text-sm max-w-xs sm:max-w-none">
            {isUploading 
              ? 'Please wait while we process your file'
              : 'Drag and drop your resume file, or click to browse'
            }
          </p>
        </div>
      </div>

      {/* Upload Status */}
      {uploadStatus.type && (
        <div className={`mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}
