import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fileId = params.id;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get the file to check ownership and get blob URL
    const file = await prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if the user owns this file
    if (file.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete related data with error handling for schema mismatches
    try {
      await prisma.$transaction([
        // Delete resume suggestions (this should work)
        prisma.resumeSuggestion.deleteMany({
          where: { userId: session.user.id },
        }),
        // Delete chat messages (this should work)
        prisma.chatMessage.deleteMany({
          where: { userId: session.user.id },
        }),
        // Delete resume reviews (this should work)
        prisma.resumeReview.deleteMany({
          where: { userId: session.user.id },
        }),
      ]);
    } catch (transactionError) {
      console.error('Error in transaction:', transactionError);
      // Continue with deletion even if some related data deletion fails
    }

    // Try to delete resume versions if the schema supports it
    try {
      await prisma.resumeVersion.deleteMany({
        where: { originalFileId: fileId },
      });
    } catch (versionError) {
      console.error('Error deleting resume versions (schema may not be updated):', versionError);
      // This is expected if the database schema doesn't have originalFileId yet
    }

    // Delete the file from the database
    await prisma.uploadedFile.delete({
      where: { id: fileId },
    });

    // Delete the blob from Vercel Blob storage
    try {
      await del(file.blobUrl);
      console.log(`Successfully deleted blob: ${file.blobUrl}`);
    } catch (blobError) {
      console.error('Error deleting blob:', blobError);
      // Don't fail the request if blob deletion fails
      // The blob might have already been deleted or the URL might be invalid
    }

    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
