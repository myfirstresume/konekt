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
    id: 'mocks',
    name: "Mocks",
    price: 25,
    period: "/mo",
    description: "Get 4 live mocks per month",
    features: [
      "4 live mocks per month",
      "$10 per additional mock",
    ],
    popular: false,
    buttonText: "Get Mocks",
    buttonVariant: "outline",
    stripePriceId: process.env.STRIPE_MOCKS_PRICE_ID || '',
    limits: {
      resumeReviews: 0,
      followUpQuestions: 0,
      voiceNotes: 0,
      liveMocks: 4
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
