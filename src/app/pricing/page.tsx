'use client';

import { useState, useEffect, Suspense } from 'react';
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
      answer: "Live mocks can be recored at the discretion of the professional."
    },
    {
      question: "How do I know the person I'm talking to is a professional if its anonymous?",
      answer: "We have a strict vetting process for all our interviewers. They are all professionals at top companies and have a minimum of 1 year of experience."
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

function PricingPageContent() {
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mfr-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        {/* Welcome Message for New Users */}
        {showWelcome && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Welcome to Konekt!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your account has been created successfully. Choose a plan below to get started with your resume review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get professional resume feedback and interview preparation. All plans include unlimited access to our AI-powered tools.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                userId={userId}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
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

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mfr-primary"></div>
        </main>
        <Footer />
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  );
}
