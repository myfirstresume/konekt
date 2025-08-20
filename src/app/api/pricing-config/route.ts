import { NextResponse } from 'next/server';
import { pricingTiers } from '@/config/pricing';

export async function GET() {
  const validation = {
    isValid: true,
    missingPrices: [] as string[],
    configuredPrices: {} as Record<string, string>
  };

  pricingTiers.forEach(tier => {
    if (!tier.stripePriceId) {
      validation.isValid = false;
      validation.missingPrices.push(tier.name);
    } else {
      validation.configuredPrices[tier.id] = tier.stripePriceId;
    }
  });

  return NextResponse.json(validation);
}
