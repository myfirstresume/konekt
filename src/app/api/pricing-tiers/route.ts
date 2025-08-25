import { NextResponse } from 'next/server';

export async function GET() {
  const pricingTiers = [
    {
      id: 'freshman',
      name: "Freshman",
      price: 15,
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
      buttonVariant: "outline" as const,
      stripePriceId: process.env.STRIPE_FRESHMAN_PRICE_ID || '',
      limits: {
        resumeReviews: 3,
        followUpQuestions: 100,
        voiceNotes: 10,
        liveMocks: 0
      }
    },
    {
      id: 'sophomore',
      name: "Sophomore",
      price: 30,
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
      buttonVariant: "primary" as const,
      stripePriceId: process.env.STRIPE_SOPHOMORE_PRICE_ID || '',
      limits: {
        resumeReviews: 5,
        followUpQuestions: 200,
        voiceNotes: 15,
        liveMocks: 1
      }
    },
    {
      id: 'mocks',
      name: "Mocks",
      price: 25,
      period: "/mo",
      description: "Get 4 live mocks per month",
      features: [
        "4 live mocks per month",
        "Live personalized feedback",
        "$10 per additional mock",
      ],
      popular: false,
      buttonText: "Get Mocks",
      buttonVariant: "outline" as const,
      stripePriceId: process.env.STRIPE_MOCKS_PRICE_ID || '',
      limits: {
        resumeReviews: 15,
        followUpQuestions: 500,
        voiceNotes: 50,
        liveMocks: 3
      }
    }
  ];

  return NextResponse.json(pricingTiers);
}
