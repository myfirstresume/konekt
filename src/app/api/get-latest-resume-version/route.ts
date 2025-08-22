import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLatestResumeVersion } from '@/utils/resume-cache';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const originalFileId = searchParams.get('originalFileId');

    if (!originalFileId) {
      return NextResponse.json(
        { error: 'Original file ID is required' },
        { status: 400 }
      );
    }

    // Get the latest version for this file
    const latestVersion = await getLatestResumeVersion(session.user.id, originalFileId);

    if (latestVersion) {
      return NextResponse.json({
        success: true,
        version: {
          id: latestVersion.id,
          versionName: latestVersion.versionName,
          resumeContent: latestVersion.resumeContent,
          blobUrl: latestVersion.blobUrl,
          appliedSuggestions: latestVersion.appliedSuggestions,
          createdAt: latestVersion.createdAt
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        version: null
      });
    }

  } catch (error) {
    console.error('Error getting latest resume version:', error);
    return NextResponse.json(
      { error: 'Failed to get latest resume version' },
      { status: 500 }
    );
  }
}
