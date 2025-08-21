import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current usage data
    const usage = await prisma.subscriptionUsage.findUnique({
      where: { userId: session.user.id }
    });

    if (!usage) {
      // Return default usage if none exists
      return NextResponse.json({
        resumeReviewsUsed: 0,
        resumeReviewsLimit: 5,
        followUpQuestionsUsed: 0,
        followUpQuestionsLimit: 200,
        voiceNotesUsed: 0,
        voiceNotesLimit: 15,
        liveMocksUsed: 0,
        liveMocksLimit: 1,
        usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      });
    }

    return NextResponse.json({
      resumeReviewsUsed: usage.resumeReviewsUsed,
      resumeReviewsLimit: usage.resumeReviewsLimit,
      followUpQuestionsUsed: usage.followUpQuestionsUsed,
      followUpQuestionsLimit: usage.followUpQuestionsLimit,
      voiceNotesUsed: usage.voiceNotesUsed,
      voiceNotesLimit: usage.voiceNotesLimit,
      liveMocksUsed: usage.liveMocksUsed,
      liveMocksLimit: usage.liveMocksLimit,
      usageResetDate: usage.usageResetDate
    });

  } catch (error) {
    console.error('Error in usage API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
