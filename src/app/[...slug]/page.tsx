'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CatchAllPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default function CatchAllPage({ params }: CatchAllPageProps) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const resolvedParams = await params;
        // Get the last segment from the slug array
        const lastSegment = resolvedParams.slug[resolvedParams.slug.length - 1];
        
        // Check if it looks like a referral ID (8 characters, alphanumeric)
        if (lastSegment && lastSegment.length === 8 && /^[a-z0-9]+$/.test(lastSegment)) {
          // Redirect to home page with the referral ID in the URL
          router.replace(`/?ref=${lastSegment}`);
        } else {
          // For any other invalid routes, redirect to home
          router.replace('/');
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        router.replace('/');
      } finally {
        setIsRedirecting(false);
      }
    };

    handleRedirect();
  }, [params, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mfr-primary mx-auto mb-4"></div>
        {/* <p className="text-gray-600">Redirecting...</p> */}
      </div>
    </div>
  );
}
