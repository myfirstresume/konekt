'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function AuthGuard({ children, requireSubscription = true }: AuthGuardProps) {
  const { userId, isLoading, user } = useAuth();
  const router = useRouter();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  // Check subscription status
  useEffect(() => {
    if (!userId || isLoading) return;

    const checkSubscription = async () => {
      setIsCheckingSubscription(true);
      try {
        const response = await fetch(`/api/subscription?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data.subscription && data.subscription.status === 'active');
        } else {
          setHasActiveSubscription(false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [userId, isLoading]);

  // Show loading state
  if (isLoading || isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!userId || !user) {
    router.push('/login');
    return null;
  }

  // If subscription is required, check for active subscription
  if (requireSubscription) {
    if (hasActiveSubscription === false) {
      router.push('/pricing');
      return null;
    }
    
    // Still checking subscription
    if (hasActiveSubscription === null) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Checking subscription...</p>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required subscription (if needed)
  return <>{children}</>;
}
