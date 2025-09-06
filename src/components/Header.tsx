'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Type assertion for user to ensure user.id is available
  const typedUser = user as any;

  // Check if user has active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !typedUser?.id) {
        setHasActiveSubscription(false);
        return;
      }

      setIsCheckingSubscription(true);
      try {
        const response = await fetch(`/api/subscription?userId=${typedUser.id}`);
        const data = await response.json();
        // Check that subscription exists, is active, and not cancelled
        setHasActiveSubscription(
          !!data.subscription && 
          data.subscription.status === 'active' && 
          data.subscription.status !== 'canceled'
        );
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, typedUser?.id]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-100">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
        <Image
          src="/mfr_logo.png"
          alt="Konekt Logo"
          width={40}
          height={40}
          className="w-6 h-6 sm:w-7 sm:h-7"
        />
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Konekt</h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
        {isLoading || isCheckingSubscription ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
        ) : isAuthenticated ? (
          hasActiveSubscription ? (
            // User has active subscription - show app navigation
            <>
              <Link href="/resumes" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Resumes
              </Link>
              <Link href="/mock" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Mock Interview
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Dashboard
              </Link>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base"
                  >
                    Sign out
                  </button>
                  <div className="w-10 h-10 rounded-full bg-mfr-primary flex items-center justify-center">
                    <span className="text-white text-base font-medium">
                      {typedUser?.name 
                        ? typedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : typedUser?.email 
                          ? typedUser.email[0].toUpperCase()
                          : 'FR'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // User is authenticated but no active subscription - show marketing navigation
            <>
              {/* <a href="/features" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Features
              </a> */}
              {/* <a href="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Pricing
              </a> */}
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Dashboard
              </Link>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base"
                  >
                    Sign out
                  </button>
                  <div className="w-10 h-10 rounded-full bg-mfr-primary flex items-center justify-center">
                    <span className="text-white text-base font-medium">
                      {typedUser?.name 
                        ? typedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : typedUser?.email 
                          ? typedUser.email[0].toUpperCase()
                          : 'FR'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </>
          )
        ) : (
          // User is not authenticated - show public navigation
          <>
            <Link href="/students" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
              For students
            </Link>
            <Link href="/professionals" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
              For professionals
            </Link>
            {/* <a href="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
              Pricing
            </a> */}
            <div className="flex items-center space-x-4">
              {/* <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors text-sm lg:text-base">
                Log in
              </Link> */}
                              <button 
                  onClick={() => {
                    // Try to find the waitlist form on the current page with a small delay
                    setTimeout(() => {
                      let element = document.getElementById('waitlist-email');
                      console.log('Looking for waitlist-email element:', element);
                      
                      // If waitlist-email not found, try the waitlist container
                      if (!element) {
                        element = document.getElementById('waitlist');
                        console.log('Looking for waitlist container element:', element);
                      }
                      
                      if (element) {
                        // If found, scroll to it using scrollIntoView with better options
                        console.log('Scrolling to element:', element);
                        
                        element.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'nearest'
                        });
                        
                        // Try to focus the email input after scrolling completes
                        setTimeout(() => {
                          const emailInput = document.getElementById('waitlist-email');
                          if (emailInput) {
                            emailInput.focus();
                          }
                        }, 1000);
                      } else {
                        // If not found, navigate to the main page and scroll to waitlist
                        console.log('No waitlist element found, navigating to main page');
                        router.push('/');
                        // Set a flag in sessionStorage to scroll to waitlist after navigation
                        sessionStorage.setItem('scrollToWaitlist', 'true');
                      }
                    }, 100);
                  }}
                  className="bg-mfr-primary text-white px-4 sm:px-6 py-2 rounded-md hover:mfr-primary/80 transition-colors text-sm lg:text-base hover:cursor-pointer"
                >
                  Request early access
                </button>
            </div>
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 md:hidden z-50 shadow-lg">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            {isLoading || isCheckingSubscription ? (
              <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
            ) : isAuthenticated ? (
              hasActiveSubscription ? (
                // User has active subscription - show app navigation
                <>
                  <Link 
                    href="/resumes" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Resumes
                  </Link>
                  <Link 
                    href="/review" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Review
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-mfr-primary flex items-center justify-center">
                      <span className="text-white text-base font-medium">
                        {user?.name 
                          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : user?.email 
                            ? user.email[0].toUpperCase()
                            : 'FR'
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2 text-left"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                // User is authenticated but no active subscription - show marketing navigation
                <>
                  {/* <a 
                    href="/features" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </a> */}
                  <Link 
                    href="/pricing" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-mfr-primary flex items-center justify-center">
                      <span className="text-white text-base font-medium">
                        {user?.name 
                          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : user?.email 
                            ? user.email[0].toUpperCase()
                            : 'FR'
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-gray-900 transition-colors py-2 text-left"
                  >
                    Sign out
                  </button>
                </>
              )
            ) : (
              // User is not authenticated - show public navigation
              <>
                <Link 
                  href="/students" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  For students
                </Link>
                <Link 
                  href="/professionals" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  For professionals
                </Link>
                {/* <a 
                  href="/features" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a> */}
                {/* <a 
                  href="/pricing" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a> */}
                {/* <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link> */}
                <button 
                  className="bg-gray-200 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors text-left hover:cursor-pointer w-full text-left"
                  onClick={() => {
                    setIsMenuOpen(false);
                    
                    // Try to find the waitlist form on the current page with a small delay
                    setTimeout(() => {
                      let element = document.getElementById('waitlist-email');
                      console.log('Mobile: Looking for waitlist-email element:', element);
                      
                      // If waitlist-email not found, try the waitlist container
                      if (!element) {
                        element = document.getElementById('waitlist');
                        console.log('Mobile: Looking for waitlist container element:', element);
                      }
                      
                      if (element) {
                        // If found, scroll to it using scrollIntoView with better options
                        console.log('Mobile: Scrolling to element:', element);
                        
                        element.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                          inline: 'nearest'
                        });
                        
                        // Try to focus the email input after scrolling completes
                        setTimeout(() => {
                          const emailInput = document.getElementById('waitlist-email');
                          if (emailInput) {
                            emailInput.focus();
                          }
                        }, 1000);
                      } else {
                        // If not found, navigate to the main page and scroll to waitlist
                        console.log('Mobile: No waitlist element found, navigating to main page');
                        router.push('/');
                        // Set a flag in sessionStorage to scroll to waitlist after navigation
                        sessionStorage.setItem('scrollToWaitlist', 'true');
                      }
                    }, 100);
                  }}
                >
                  Request early access
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
