'use client';

import { useState } from 'react';

interface JobDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobDescriptionAdded: (description: string) => void;
}

interface ScrapedJobData {
  title: string;
  company: string;
  description: string;
  url: string;
  scrapedAt: Date;
}

export default function JobDescriptionModal({ isOpen, onClose, onJobDescriptionAdded }: JobDescriptionModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedJobData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a job posting URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setScrapedData(null);

    try {
      const response = await fetch('/api/scrape-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape job description');
      }

      if (data.success) {
        setScrapedData(data.data);
        // Pass the formatted description to the parent component
        onJobDescriptionAdded(data.formattedDescription);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to scrape job description');
      }
    } catch (err) {
      console.error('Error scraping job description:', err);
      setError(err instanceof Error ? err.message : 'Failed to scrape job description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setError(null);
    setScrapedData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Job Description</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Paste a job posting URL from LinkedIn, Ashby, or Workday to get tailored resume feedback.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Supported Platforms:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• LinkedIn Jobs (linkedin.com/jobs/...)</li>
                <li>• Ashby (jobs.ashbyhq.com/...) coming soon!</li>
                <li>• Workday (workday.com/... or myworkdayjobs.com/...) coming soon!</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-2">
                Job Posting URL
              </label>
              <input
                type="url"
                id="job-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-mfr-primary focus:border-mfr-primary"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-mfr-primary border border-transparent rounded-md hover:bg-mfr-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mfr-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Scraping...</span>
                  </div>
                ) : (
                  'Add Job Description'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
