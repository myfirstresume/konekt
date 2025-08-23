import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface CachedComment {
  id: string;
  text: string;
  why: string;
  status: 'pending' | 'accepted' | 'rejected';
  position: { start: number; end: number };
  category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
  reference_text?: string;
}

/**
 * Generates a SHA-256 hash of the resume content
 */
export function generateResumeHash(resumeContent: string): string {
  return crypto.createHash('sha256').update(resumeContent).digest('hex');
}

/**
 * Retrieves cached resume review from database
 */
export async function getCachedResumeReview(userId: string, resumeHash: string): Promise<CachedComment[] | null> {
  try {
    const cachedReview = await prisma.resumeReview.findUnique({
      where: {
        userId_resumeHash: {
          userId,
          resumeHash,
        },
      },
    });

    if (cachedReview) {
      const comments = JSON.parse(cachedReview.comments) as CachedComment[];
      console.log(`Found cached resume review for user ${userId}`);
      return comments;
    }

    console.log(`No cached resume review found for user ${userId}`);
    return null;
  } catch (error) {
    console.error('Error retrieving cached resume review:', error);
    return null;
  }
}

/**
 * Saves resume review to database cache
 */
export async function saveResumeReviewToCache(
  userId: string, 
  resumeHash: string, 
  comments: CachedComment[]
): Promise<void> {
  try {
    await prisma.resumeReview.upsert({
      where: {
        userId_resumeHash: {
          userId,
          resumeHash,
        },
      },
      update: {
        comments: JSON.stringify(comments),
        updatedAt: new Date(),
      },
      create: {
        userId,
        resumeHash,
        comments: JSON.stringify(comments),
      },
    });

    console.log(`Saved resume review to cache for user ${userId}`);
  } catch (error) {
    console.error('Error saving resume review to cache:', error);
    throw error;
  }
}

/**
 * Deletes cached resume review
 */
export async function deleteCachedResumeReview(userId: string, resumeHash: string): Promise<void> {
  try {
    // First check if the review exists
    const existingReview = await prisma.resumeReview.findUnique({
      where: {
        userId_resumeHash: {
          userId,
          resumeHash,
        },
      },
    });

    if (existingReview) {
      await prisma.resumeReview.delete({
        where: {
          userId_resumeHash: {
            userId,
            resumeHash,
          },
        },
      });
      console.log(`Deleted cached resume review for user ${userId}`);
    } else {
      console.log(`No cached resume review found for user ${userId}, nothing to delete`);
    }
  } catch (error) {
    console.error('Error deleting cached resume review:', error);
    // Don't throw the error - it's not critical if we can't delete a non-existent record
    console.log('Continuing with re-review process...');
  }
}

/**
 * Saves a new resume version to the database
 */
export async function saveResumeVersion(
  userId: string,
  versionName: string,
  resumeContent: string,
  originalFileId: string,
  blobUrl: string,
  fileSize: number,
  fileType: string,
  appliedSuggestions?: CachedComment[]
): Promise<void> {
  try {
    await prisma.resumeVersion.create({
      data: {
        userId,
        versionName,
        resumeContent,
        originalFileId,
        blobUrl,
        fileSize,
        fileType,
        appliedSuggestions: appliedSuggestions ? JSON.stringify(appliedSuggestions) : null,
      },
    });

    console.log(`Saved resume version "${versionName}" for user ${userId}`);
  } catch (error: any) {
    // Check if this is a column missing error
    if (error.code === 'P2022') {
      console.log('originalFileId column does not exist yet, cannot save resume version');
      throw new Error('Database schema not ready for resume version saving. Please try again later.');
    }
    
    console.error('Error saving resume version:', error);
    throw error;
  }
}

/**
 * Gets the latest resume version for a user
 */
export async function getLatestResumeVersion(userId: string, originalFileId: string): Promise<{
  id: string;
  versionName: string;
  resumeContent: string;
  blobUrl: string;
  appliedSuggestions?: CachedComment[];
  createdAt: Date;
} | null> {
  try {
    // Check if the originalFileId column exists by trying a simple query first
    let latestVersion;
    try {
      latestVersion = await prisma.resumeVersion.findFirst({
        where: { 
          userId,
          originalFileId
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (columnError: any) {
      // If the column doesn't exist, return null gracefully
      if (columnError.code === 'P2022') {
        console.log('originalFileId column does not exist yet, returning null');
        return null;
      }
      throw columnError;
    }

    if (latestVersion) {
      return {
        ...latestVersion,
        appliedSuggestions: latestVersion.appliedSuggestions 
          ? JSON.parse(latestVersion.appliedSuggestions) as CachedComment[]
          : undefined,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting latest resume version:', error);
    return null;
  }
}