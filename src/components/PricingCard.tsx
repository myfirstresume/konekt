'use client';

import { useState } from 'react';
import { createSubscriptionCheckoutSession } from '@/app/actions/stripe';

interface PricingCardProps {
  tier: {
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
  };
  userId?: string;
}

export default function PricingCard({ tier, userId }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!tier.stripePriceId || tier.stripePriceId === '') {
      alert('This plan is not available for purchase at the moment. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      const { url } = await createSubscriptionCheckoutSession(tier.id, userId);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('There was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !tier.stripePriceId || tier.stripePriceId === '';

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 ${
        tier.popular
          ? 'border-mfr-primary bg-mfr-primary/5 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-gray-300 transition-colors'
      } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {/* Popular Badge */}
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-mfr-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {tier.name}
        </h3>
        <p className="text-gray-600 text-sm">
          {tier.description}
        </p>
      </div>

      {/* Price */}
      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">
            ${tier.price}
          </span>
          <span className="text-gray-600 ml-1">
            {tier.period}
          </span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {tier.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={isLoading || isDisabled}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
          tier.popular
            ? 'bg-mfr-primary text-white hover:bg-mfr-primary/80 disabled:opacity-50'
            : 'bg-white text-mfr-primary border-2 border-mfr-primary hover:bg-mfr-primary hover:text-white disabled:opacity-50'
        }`}
      >
        {isLoading ? 'Processing...' : 
         isDisabled ? 'Coming Soon' :
         userId ? tier.buttonText : 'Sign in to Subscribe'}
      </button>
    </div>
  );
}
