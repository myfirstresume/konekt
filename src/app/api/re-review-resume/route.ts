import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { deleteCachedResumeReview, generateResumeHash } from '@/utils/resume-cache';

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

    // Delete cached review
    await deleteCachedResumeReview(session.user.id, resumeHash);
    console.log(`Deleted cached review for user ${session.user.id}`);

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
