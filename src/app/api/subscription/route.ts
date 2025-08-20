import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription and usage data
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId },
      include: {
        user: {
          include: {
            usage: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { subscription: null },
        { status: 200 }
      );
    }

    // Format the response
    const response = {
      subscription: {
        planName: subscription.planName,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        usage: subscription.user?.usage ? {
          resumeReviewsUsed: subscription.user.usage.resumeReviewsUsed,
          resumeReviewsLimit: subscription.user.usage.resumeReviewsLimit,
          followUpQuestionsUsed: subscription.user.usage.followUpQuestionsUsed,
          followUpQuestionsLimit: subscription.user.usage.followUpQuestionsLimit,
          voiceNotesUsed: subscription.user.usage.voiceNotesUsed,
          voiceNotesLimit: subscription.user.usage.voiceNotesLimit,
          liveMocksUsed: subscription.user.usage.liveMocksUsed,
          liveMocksLimit: subscription.user.usage.liveMocksLimit,
        } : null
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
