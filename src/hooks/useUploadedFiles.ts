'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  blobUrl: string;
  isProcessed: boolean;
  processingStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useUploadedFiles() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const fetchFiles = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/uploaded-files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Network error while fetching files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchFiles();
    }
  }, [isAuthenticated, authLoading]);

  const addFile = (file: UploadedFile) => {
    setFiles(prev => [file, ...prev]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFile = (fileId: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  return {
    files,
    isLoading,
    error,
    refetch: fetchFiles,
    addFile,
    removeFile,
    updateFile
  };
}
