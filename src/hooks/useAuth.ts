'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth(requireAuth = false) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [requireAuth, status, router]);

  return {
    session,
    status,
    user: session?.user,
    userId: (session?.user as any)?.id,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
