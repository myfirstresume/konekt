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
    await prisma.resumeReview.delete({
      where: {
        userId_resumeHash: {
          userId,
          resumeHash,
        },
      },
    });

    console.log(`Deleted cached resume review for user ${userId}`);
  } catch (error) {
    console.error('Error deleting cached resume review:', error);
    throw error;
  }
}
