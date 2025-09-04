'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadBox from "@/components/UploadBox";
import WaitlistForm from "@/components/WaitlistForm";
import GlobeComponent from "@/components/Globe";
import FeatureCardsContainer from "@/components/FeatureCardsContainer";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { userId, isLoading } = useAuth();
  const LOGO_SCALING = 3;

  // Handle navigation to waitlist section
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we should scroll to waitlist (from sessionStorage flag)
      const shouldScrollToWaitlist = sessionStorage.getItem('scrollToWaitlist');
      if (shouldScrollToWaitlist) {
        sessionStorage.removeItem('scrollToWaitlist');
        const element = document.getElementById('waitlist');
        if (element) {
          // Small delay to ensure the page is fully rendered
          setTimeout(() => {
            // Use a more reliable scrolling method
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            
            window.scrollTo({
              top: middle,
              behavior: 'smooth'
            });
            
            // Focus the email input after scrolling
            const emailInput = document.getElementById('waitlist-email');
            if (emailInput) {
              setTimeout(() => {
                emailInput.focus();
              }, 800);
            }
          }, 100);
        }
      }
      // Also handle direct hash navigation
      else if (window.location.hash === '#waitlist') {
        const element = document.getElementById('waitlist');
        if (element) {
          // Small delay to ensure the page is fully rendered
          setTimeout(() => {
            // Use a more reliable scrolling method
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middle = absoluteElementTop - (window.innerHeight / 2);
            
            window.scrollTo({
              top: middle,
              behavior: 'smooth'
            });
            
            // Focus the email input after scrolling
            const emailInput = document.getElementById('waitlist-email');
            if (emailInput) {
              setTimeout(() => {
                emailInput.focus();
              }, 800);
            }
          }, 100);
        }
      }
    }
  }, []);

  const handleUploadSuccess = (fileUrl: string, filename: string) => {
    // Handle successful upload - could redirect to AI review page
    console.log('Upload successful:', { filename });
    // Here you would typically redirect to the AI review page
    // or trigger the AI processing
  };

  const handleUploadError = (error: string) => {
    // Handle upload error - could show additional error handling
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {!userId && !isLoading ? (
            // Landing page for non-authenticated users
            <div className="space-y-12 sm:space-y-16">
              {/* Hero Section */}
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start pt-4 sm:pt-8">
                {/* Left Column - Value Proposition */}
                <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
                  <div className="space-y-4 max-w-md">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                      You&apos;re one conversation away {' '}
                      <span className="text-mfr-primary">from your dream job</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600">
                      We&apos;ll connect you with the right industry professionals to help you achieve your career goals.
                    </p>
                  </div>

                  {/* Waitlist Signup Form */}
                  <div id="waitlist" className="max-w-md">
                    <WaitlistForm />
                  </div>
                </div>
                
                {/* Right Column - Globe Visualization */}
                <div className="relative order-1 lg:order-2 -mt-4 sm:-mt-8 lg:mt-0 overflow-visible">
                  <GlobeComponent />
                </div>
              </div>

              {/* Scrolling Logos Section */}
              <div className="text-center">
                <p className="text-base sm:text-lg text-gray-600 mb-4">With professionals from leading companies:</p>
                <div className="relative overflow-hidden max-w-5xl mx-auto">
                  <div className="flex animate-scroll space-x-4 sm:space-x-8">
                    <div className="flex space-x-8 sm:space-x-16 min-w-max">
                      <Image src="/logos/google.png" alt="Google" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      {/* <Image src="/logos/bain.jpg" alt="Bain" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" /> */}
                      <Image src="/logos/ey.png" alt="EY" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mck.png" alt="McKinsey" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mstanley.png" alt="Morgan Stanley" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/otpp.png" alt="OTPP" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                    
                      {/* Second round */}
                      <Image src="/logos/google.png" alt="Google" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      {/* <Image src="/logos/bain.jpg" alt="Bain" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" /> */}
                      <Image src="/logos/ey.png" alt="EY" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mck.png" alt="McKinsey" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mstanley.png" alt="Morgan Stanley" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/otpp.png" alt="OTPP" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />

                      {/* Third round */}
                      <Image src="/logos/google.png" alt="Google" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      {/* <Image src="/logos/bain.jpg" alt="Bain" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" /> */}
                      <Image src="/logos/ey.png" alt="EY" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mck.png" alt="McKinsey" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/mstanley.png" alt="Morgan Stanley" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                      <Image src="/logos/otpp.png" alt="OTPP" width={80 * LOGO_SCALING} height={40 * LOGO_SCALING} className="h-6 sm:h-8 w-auto grayscale opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards Section */}
              <FeatureCardsContainer />

            </div>
          ) : (
            // Landing page for authenticated users
            <div className="space-y-12 sm:space-y-16">
              {/* Feature Cards Section */}
              <FeatureCardsContainer />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
