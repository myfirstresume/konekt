import { prisma } from '@/lib/prisma';

export interface CachedSuggestion {
  id: string;
  text: string;
  why: string;
  status: 'pending' | 'accepted' | 'rejected';
  position: { start: number; end: number };
  category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
  reference_text?: string;
  resumeHash: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Saves suggestions to cache
 */
export async function saveSuggestionsToCache(
  userId: string,
  resumeHash: string,
  suggestions: CachedSuggestion[]
): Promise<void> {
  try {
    // First, get existing suggestions for this resume
    const existingSuggestions = await prisma.resumeSuggestion.findMany({
      where: {
        userId,
        resumeHash,
      },
    });

    // Create a map of existing suggestions by their text for easy lookup
    const existingMap = new Map(existingSuggestions.map(s => [s.text, true]));

    // Filter out suggestions that already exist
    const newSuggestions = suggestions.filter(suggestion => !existingMap.has(suggestion.text));

    if (newSuggestions.length > 0) {
      // Save new suggestions
      await prisma.resumeSuggestion.createMany({
        data: newSuggestions.map(suggestion => ({
          userId,
          resumeHash,
          text: suggestion.text,
          why: suggestion.why,
          status: suggestion.status,
          positionStart: suggestion.position.start,
          positionEnd: suggestion.position.end,
          category: suggestion.category,
          referenceText: suggestion.reference_text || null,
        })),
      });

      console.log(`Saved ${newSuggestions.length} new suggestions to cache for user ${userId}`);
    }
  } catch (error) {
    console.error('Error saving suggestions to cache:', error);
    throw error;
  }
}

/**
 * Gets cached suggestions for a resume
 */
export async function getCachedSuggestions(
  userId: string,
  resumeHash: string
): Promise<CachedSuggestion[]> {
  try {
    const cachedSuggestions = await prisma.resumeSuggestion.findMany({
      where: {
        userId,
        resumeHash,
        status: 'pending', // Only get pending suggestions
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return cachedSuggestions.map(suggestion => ({
      id: suggestion.id,
      text: suggestion.text,
      why: suggestion.why,
      status: suggestion.status as 'pending' | 'accepted' | 'rejected',
      position: {
        start: suggestion.positionStart,
        end: suggestion.positionEnd,
      },
      category: suggestion.category as 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice',
      reference_text: suggestion.referenceText || undefined,
      resumeHash: suggestion.resumeHash,
      userId: suggestion.userId,
      createdAt: suggestion.createdAt,
      updatedAt: suggestion.updatedAt,
    }));
  } catch (error) {
    console.error('Error getting cached suggestions:', error);
    return [];
  }
}

/**
 * Updates the status of a suggestion
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: 'accepted' | 'rejected' | 'pending'
): Promise<void> {
  try {
    await prisma.resumeSuggestion.update({
      where: { id: suggestionId },
      data: { status },
    });
  } catch (error) {
    console.error('Error updating suggestion status:', error);
    throw error;
  }
}

/**
 * Removes accepted/rejected suggestions from cache
 */
export async function cleanupHandledSuggestions(
  userId: string,
  resumeHash: string
): Promise<void> {
  try {
    await prisma.resumeSuggestion.deleteMany({
      where: {
        userId,
        resumeHash,
        status: {
          in: ['accepted', 'rejected'],
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up handled suggestions:', error);
    throw error;
  }
}
