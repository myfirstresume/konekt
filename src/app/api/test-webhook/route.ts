import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPricingTierById } from '@/config/pricing';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tierId = searchParams.get('tierId') || 'sophomore';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Mock subscription data
    const mockSubscriptionId = 'sub_test_' + Date.now();
    const tier = getPricingTierById(tierId);
    
    if (!tier) {
      return NextResponse.json(
        { error: 'Invalid tier ID' },
        { status: 400 }
      );
    }

    // Create subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { stripeSubscriptionId: mockSubscriptionId },
      update: {
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      create: {
        stripeSubscriptionId: mockSubscriptionId,
        stripePriceId: tier.stripePriceId,
        stripeProductId: 'prod_test',
        userId: userId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        planName: tier.name,
        planFeatures: JSON.stringify(tier),
      },
    });

    // Create or update usage tracking
    const usage = await prisma.subscriptionUsage.upsert({
      where: { userId: userId },
      update: {
        resumeReviewsLimit: tier.limits.resumeReviews,
        followUpQuestionsLimit: tier.limits.followUpQuestions,
        voiceNotesLimit: tier.limits.voiceNotes,
        liveMocksLimit: tier.limits.liveMocks,
        usageResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      create: {
        userId: userId,
        resumeReviewsLimit: tier.limits.resumeReviews,
        followUpQuestionsLimit: tier.limits.followUpQuestions,
        voiceNotesLimit: tier.limits.voiceNotes,
        liveMocksLimit: tier.limits.liveMocks,
        usageResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: subscription,
      usage: usage,
      message: 'Test subscription created successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating test subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
