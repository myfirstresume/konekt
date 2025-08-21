import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { deleteCachedResumeReview, generateResumeHash } from '@/utils/resume-cache';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resume } = await request.json();
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }

    // Generate hash of resume content
    const resumeHash = generateResumeHash(resume);
    console.log(`Generated resume hash for re-review: ${resumeHash.substring(0, 8)}...`);

    // Check usage limits before allowing re-review
    const currentUsage = await prisma.subscriptionUsage.findUnique({
      where: { userId: session.user.id }
    });

    if (currentUsage && currentUsage.resumeReviewsUsed >= currentUsage.resumeReviewsLimit) {
      return NextResponse.json({ 
        error: 'Monthly review limit reached. Please upgrade your plan to continue.',
        limitReached: true
      }, { status: 429 });
    }

    // Delete cached review
    await deleteCachedResumeReview(session.user.id, resumeHash);
    console.log(`Deleted cached review for user ${session.user.id}`);

    // Increment review count for manual re-review
    try {
      await prisma.subscriptionUsage.upsert({
        where: { userId: session.user.id },
        update: {
          resumeReviewsUsed: {
            increment: 1
          }
        },
        create: {
          userId: session.user.id,
          resumeReviewsUsed: 1,
          resumeReviewsLimit: 5, // Default limit
          followUpQuestionsUsed: 0,
          followUpQuestionsLimit: 200,
          voiceNotesUsed: 0,
          voiceNotesLimit: 15,
          liveMocksUsed: 0,
          liveMocksLimit: 1,
          usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // First day of next month
        }
      });
    } catch (error) {
      console.error('Error updating review count:', error);
      // Continue even if tracking fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Cache cleared successfully. Next review will call OpenAI API.'
    });

  } catch (error) {
    console.error('Error in re-review-resume API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
