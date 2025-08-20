'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCard from "@/components/PricingCard";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from 'next/navigation';

const faqs = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "What if I need more reviews?",
      answer: "Additional resume reviews can be purchased at the rates shown in each plan. No long-term commitment required."
    },
    {
      question: "Are live mocks recorded?",
      answer: "Yes, all live mock interviews are recorded so you can review them later and track your progress."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees or penalties."
    }
];

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  buttonText: string;
  buttonVariant: 'outline' | 'primary';
  stripePriceId: string;
  limits: {
    resumeReviews: number;
    followUpQuestions: number;
    voiceNotes: number;
    liveMocks: number;
  };
}

interface PricingValidation {
  isValid: boolean;
  missingPrices: string[];
  configuredPrices: Record<string, string>;
}

export default function PricingPage() {
  const { userId, isLoading, user } = useAuth();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get('newUser') === 'true';
  const [showWelcome, setShowWelcome] = useState(false);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [pricingValidation, setPricingValidation] = useState<PricingValidation>({
    isValid: true,
    missingPrices: [],
    configuredPrices: {}
  });
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Fetch pricing data from server
    const fetchPricingData = async () => {
      try {
        const [tiersResponse, validationResponse] = await Promise.all([
          fetch('/api/pricing-tiers'),
          fetch('/api/pricing-config')
        ]);
        
        const tiers = await tiersResponse.json();
        const validation = await validationResponse.json();
        
        setPricingTiers(tiers);
        setPricingValidation(validation);
      } catch (error) {
        console.error('Error fetching pricing data:', error);
      } finally {
        setIsValidating(false);
      }
    };

    fetchPricingData();
  }, []);

  useEffect(() => {
    if (isNewUser && user) {
      setShowWelcome(true);
      // Auto-hide the welcome message after 5 seconds
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, user]);

  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mfr-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Message for New Users */}
          {showWelcome && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">
                    Welcome, {user?.name || user?.email}!
                  </h3>
                  <p className="text-green-700 mt-1">
                    Great to have you on board! Choose a plan below to get started with your AI-powered resume reviews.
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setShowWelcome(false)}
                    className="text-green-400 hover:text-green-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Warning */}
          {!pricingValidation.isValid && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-yellow-800">
                    Configuration Required
                  </h3>
                  <p className="text-yellow-700 mt-1">
                    Stripe price IDs are not configured for: {pricingValidation.missingPrices.join(', ')}. 
                    Please set up the environment variables to enable purchases.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your career goals. All plans include AI-powered resume reviews and personalized feedback.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingCard 
                key={tier.id} 
                tier={tier} 
                userId={userId}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
