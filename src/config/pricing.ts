export interface PricingTier {
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

export const pricingTiers: PricingTier[] = [
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
    buttonVariant: "outline",
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
    buttonVariant: "primary",
    stripePriceId: process.env.STRIPE_SOPHOMORE_PRICE_ID || '',
    limits: {
      resumeReviews: 5,
      followUpQuestions: 200,
      voiceNotes: 15,
      liveMocks: 1
    }
  },
  {
    id: 'senior',
    name: "Senior",
    price: 70,
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
    stripePriceId: process.env.STRIPE_SENIOR_PRICE_ID || '',
    limits: {
      resumeReviews: 15,
      followUpQuestions: 500,
      voiceNotes: 50,
      liveMocks: 3
    }
  }
];

export function getPricingTierById(id: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.id === id);
}

// Validate that all price IDs are set
export function validatePricingConfiguration(): { isValid: boolean; missingPrices: string[] } {
  const missingPrices = pricingTiers
    .filter(tier => !tier.stripePriceId)
    .map(tier => tier.name);
  
  return {
    isValid: missingPrices.length === 0,
    missingPrices
  };
}
