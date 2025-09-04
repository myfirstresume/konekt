'use client';

import { useState } from 'react';

interface WaitlistFormProps {
  onSuccess?: (data: { referralLink: string; id: string }) => void;
}

export default function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [isMentor, setIsMentor] = useState(false);
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          mentor: isMentor,
          company: isMentor ? company : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setSuccess(true);
      onSuccess?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">You&apos;re on the list!</h3>
        <p className="text-gray-600">
          {isMentor 
            ? "We'll be in touch soon about joining our mentor network."
            : "We'll notify you when we launch our mentorship network service."
          }
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            type="email"
            id="waitlist-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-mfr-primary focus:border-transparent transition-colors duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="mentor"
            checked={isMentor}
            onChange={(e) => setIsMentor(e.target.checked)}
            className="w-4 h-4 text-mfr-primary border-gray-300 rounded focus:ring-mfr-primary"
          />
          <label htmlFor="mentor" className="text-sm font-medium text-gray-700">
            I&apos;m interested as a professional
          </label>
        </div>

        {isMentor && (
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              What company do you / have you worked for?
            </label>
            <input
              type="text"
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
                                      required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mfr-primary focus:border-transparent transition-colors duration-200"
              placeholder="IB, MBB, PE Global, etc."
            />
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-mfr-primary hover:bg-mfr-primary/80 disabled:bg-mfr-primary/60 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Joining...' : 'Join the waitlist'}
      </button>
    </form>
  );
}
