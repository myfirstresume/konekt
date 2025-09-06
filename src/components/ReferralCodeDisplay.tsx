'use client';

import { useState, useEffect } from 'react';
import ReferralCode from './ReferralCode';

interface ReferralCodeDisplayProps {
  email: string;
}

export default function ReferralCodeDisplay({ email }: ReferralCodeDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<{ id: string; referralLink: string; numReferrals: number } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            action: 'lookup'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data.userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchUserData();
    }
  }, [email]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">No referral data found for this email.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReferralCode 
        referralLink={userData.referralLink} 
        referralId={userData.id} 
      />
      <div className="text-center">
        <p className="text-sm text-gray-600">
          You have <span className="font-semibold text-mfr-primary">{userData.numReferrals}</span> referral{userData.numReferrals !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
