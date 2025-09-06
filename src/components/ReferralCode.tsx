'use client';

import { useState } from 'react';

interface ReferralCodeProps {
  referralLink: string;
  referralId: string;
}

export default function ReferralCode({ referralLink, referralId }: ReferralCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-4">
      {/* <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Referral Link</h3>
        <p className="text-sm text-gray-600 mb-4">
          Share this link with others to earn referral credits when they join!
        </p>
      </div> */}
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3">
            <p className="text-sm font-mono text-gray-800 break-all">
              {referralLink}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-mfr-primary hover:bg-mfr-primary/80 text-white'
            }`}
          >
            {copied ? (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {/* <span>Copied!</span> */}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {/* <span>Copy</span> */}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
