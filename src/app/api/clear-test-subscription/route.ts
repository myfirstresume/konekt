import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete test subscriptions (those with sub_test_ prefix)
    const deletedSubscriptions = await prisma.subscription.deleteMany({
      where: {
        userId: userId,
        stripeSubscriptionId: {
          startsWith: 'sub_test_'
        }
      }
    });

    // Reset usage to default values
    await prisma.subscriptionUsage.updateMany({
      where: { userId: userId },
      data: {
        resumeReviewsUsed: 0,
        followUpQuestionsUsed: 0,
        voiceNotesUsed: 0,
        liveMocksUsed: 0,
        resumeReviewsLimit: 0,
        followUpQuestionsLimit: 0,
        voiceNotesLimit: 0,
        liveMocksLimit: 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test subscriptions cleared successfully',
      deletedCount: deletedSubscriptions.count
    }, { status: 200 });

  } catch (error) {
    console.error('Error clearing test subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
