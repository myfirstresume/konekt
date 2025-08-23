import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Helper function to clean excessive newlines (same as in review page)
const cleanExcessiveNewlines = (text: string, maxNewlines: number = 3): string => {
  if (!text) return text;
  const newlinePattern = new RegExp(`\\n{${maxNewlines + 1},}`, 'g');
  const cleanedText = text.replace(newlinePattern, '\n'.repeat(maxNewlines));
  return cleanedText;
};

// Helper function to generate resume hash (same as in review page)
const generateResumeHash = (text: string): string => {
  const cleanedText = cleanExcessiveNewlines(text, 3);
  const normalizedText = cleanedText.trim().replace(/\s+/g, ' ');
  return btoa(normalizedText).slice(0, 32);
};

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileIds = searchParams.get('fileIds');

    if (!fileIds) {
      return NextResponse.json({ error: 'File IDs are required' }, { status: 400 });
    }

    const fileIdArray = fileIds.split(',');

    // Get all uploaded files for the user
    const uploadedFiles = await prisma.uploadedFile.findMany({
      where: {
        userId: session.user.id,
        id: { in: fileIdArray },
      },
      select: {
        id: true,
        originalName: true,
        blobUrl: true,
        fileType: true,
      },
    });

    // Get all resume suggestions for the user
    const suggestions = await prisma.resumeSuggestion.findMany({
      where: {
        userId: session.user.id,
        status: 'pending', // Only count pending suggestions as active reviews
      },
      select: {
        resumeHash: true,
        createdAt: true,
      },
    });

    console.log(`Found ${suggestions.length} suggestions for user ${session.user.id}`);
    console.log('Unique resume hashes:', [...new Set(suggestions.map(s => s.resumeHash))]);

    // Group suggestions by resumeHash to count reviews per resume
    // Each unique resumeHash represents one review session, regardless of how many suggestions it contains
    const reviewSessions = new Map<string, Date>();

    suggestions.forEach(suggestion => {
      // Track the latest review date for each unique resume hash
      const existingDate = reviewSessions.get(suggestion.resumeHash);
      if (!existingDate || suggestion.createdAt > existingDate) {
        reviewSessions.set(suggestion.resumeHash, suggestion.createdAt);
      }
    });

    console.log(`Found ${reviewSessions.size} unique review sessions`);

    // Create response object for each file ID
    const statusData = await Promise.all(fileIdArray.map(async (fileId) => {
      // Find the uploaded file
      const uploadedFile = uploadedFiles.find(file => file.id === fileId);
      
      if (!uploadedFile) {
        return {
          fileId,
          status: 'pending' as const,
          reviewCount: 0,
          lastReviewed: null,
        };
      }

      // Check if there's a latest version for this file
      let resumeContent = '';
      try {
        const versionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/get-latest-resume-version?originalFileId=${fileId}`);
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          if (versionData.version) {
            resumeContent = versionData.version.resumeContent;
            console.log(`File ${fileId}: Found latest version with content length: ${resumeContent.length}`);
          }
        }
      } catch (error) {
        console.log(`File ${fileId}: Could not fetch latest version:`, error);
      }

      // If no latest version, try to parse the original file
      if (!resumeContent) {
        try {
          const parseResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/parse-resume-blob`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              blobUrl: uploadedFile.blobUrl,
              fileType: uploadedFile.fileType
            }),
          });
          
          if (parseResponse.ok) {
            const parseData = await parseResponse.json();
            resumeContent = parseData.text;
            console.log(`File ${fileId}: Parsed original file with content length: ${resumeContent.length}`);
          }
        } catch (error) {
          console.log(`File ${fileId}: Could not parse original file:`, error);
        }
      }

      // Generate hash for this resume content
      const resumeHash = resumeContent ? generateResumeHash(resumeContent) : '';
      console.log(`File ${fileId}: Generated hash: ${resumeHash}`);
      
      // Check if there are suggestions for this hash
      const hasReviews = resumeHash && reviewSessions.has(resumeHash);
      const lastReviewed = hasReviews ? reviewSessions.get(resumeHash) : null;
      
      // Fallback: If we couldn't get content or hash, check if there are any versions for this file
      let fallbackHasReviews = false;
      let versionCount = 0;
      if (!hasReviews && !resumeContent) {
        try {
          versionCount = await prisma.resumeVersion.count({
            where: { originalFileId: fileId }
          });
          fallbackHasReviews = versionCount > 0;
          console.log(`File ${fileId}: Fallback check - found ${versionCount} versions`);
        } catch (error) {
          console.log(`File ${fileId}: Could not check version count:`, error);
        }
      } else {
        // Even if we have cached suggestions, let's get the actual version count
        try {
          versionCount = await prisma.resumeVersion.count({
            where: { originalFileId: fileId }
          });
          console.log(`File ${fileId}: Found ${versionCount} versions for this file`);
        } catch (error) {
          console.log(`File ${fileId}: Could not check version count:`, error);
        }
      }
      
      const finalHasReviews = hasReviews || fallbackHasReviews;
      console.log(`File ${fileId}: Final result - Has reviews: ${finalHasReviews}, Version count: ${versionCount}`);
      
      return {
        fileId,
        status: finalHasReviews ? 'reviewed' as const : 'pending' as const,
        reviewCount: versionCount, // Use actual version count instead of 1
        lastReviewed,
      };
    }));

    return NextResponse.json({ statusData });

  } catch (error) {
    console.error('Error getting resume status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
