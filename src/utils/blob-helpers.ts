import { del, list } from '@vercel/blob';

/**
 * Deletes all files for a specific user from blob storage
 * This is useful for account deletion or admin cleanup
 */
export async function deleteUserFiles(userId: string): Promise<{ success: boolean; deletedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let deletedCount = 0;

  try {
    // List all files in the user's folder
    const { blobs } = await list({
      prefix: `${userId}/`,
    });

    // Delete each file
    for (const blob of blobs) {
      try {
        await del(blob.url);
        deletedCount++;
        console.log(`Deleted user file: ${blob.url}`);
      } catch (error) {
        const errorMsg = `Failed to delete ${blob.url}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    return {
      success: errors.length === 0,
      deletedCount,
      errors
    };
  } catch (error) {
    const errorMsg = `Failed to list user files: ${error}`;
    console.error(errorMsg);
    return {
      success: false,
      deletedCount,
      errors: [errorMsg]
    };
  }
}

/**
 * Gets the folder path for a user's resumes
 */
export function getUserResumeFolder(userId: string): string {
  return `${userId}/resumes/`;
}

/**
 * Gets the folder path for a user's resume versions
 */
export function getUserVersionsFolder(userId: string): string {
  return `${userId}/versions/`;
}

/**
 * Creates a safe filename for blob storage
 */
export function createSafeFileName(originalName: string): string {
  return originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Creates a timestamped filename
 */
export function createTimestampedFileName(originalName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = createSafeFileName(originalName);
  return `${timestamp}_${safeName}`;
}
