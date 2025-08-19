'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const pricingTiers = [
  {
    name: "Freshman",
    price: "$15",
    period: "/mo",
    description: "Perfect for getting started with your career",
    features: [
      "3 resume reviews",
      "100 follow up questions",
      "10 Voice notes",
      "$10 per additional resume"
    ],
    popular: false,
    buttonText: "Get Freshman",
    buttonVariant: "outline",
    stripeUrl: "https://buy.stripe.com/test_aFa28qeJe4eTdQl4iX4Vy01"
  },
  {
    name: "Sophomore",
    price: "$30",
    period: "/mo",
    description: "Most popular choice for serious job seekers",
    features: [
      "5 resume reviews",
      "200 follow up questions",
      "$5 per additional resume",
      "15 voice notes",
      "1 live mock per month"
    ],
    popular: true,
    buttonText: "Choose Sophomore",
    buttonVariant: "primary",
    stripeUrl: "https://buy.stripe.com/test_9B6fZg1WsbHl6nT5n14Vy02"
  },
  {
    name: "Senior",
    price: "$70",
    period: "/mo",
    description: "Share with friends and save together",
    features: [
      "15 resume reviews for you and 2 friends",
      "$3 per additional review",
      "500 follow up questions",
      "3 live mocks"
    ],
    popular: false,
    buttonText: "Get Senior",
    buttonVariant: "outline",
    stripeUrl: "https://buy.stripe.com/test_8x24gy7gMfXB4fLbLp4Vy03"
  }
];

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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
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
              <div
                key={index}
                className={`relative rounded-2xl border-2 p-8 ${
                  tier.popular
                    ? 'border-mfr-primary bg-mfr-primary/5 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-gray-300 transition-colors'
                }`}
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
                      {tier.price}
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
                <a
                  href={tier.stripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors inline-block text-center ${
                    tier.popular
                      ? 'bg-mfr-primary text-white hover:bg-mfr-primary/80'
                      : 'bg-white text-mfr-primary border-2 border-mfr-primary hover:bg-mfr-primary hover:text-white'
                  }`}
                >
                  {tier.buttonText}
                </a>
              </div>
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
