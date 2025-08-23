import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { saveResumeVersion } from '@/utils/resume-cache';
import { textToDocx } from '@/utils/document-generator';
import { getUserVersionsFolder, createSafeFileName } from '@/utils/blob-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeContent, versionName, originalFileId, appliedSuggestions } = await request.json();

    if (!resumeContent || !versionName || !originalFileId) {
      return NextResponse.json(
        { error: 'Resume content, version name, and original file ID are required' },
        { status: 400 }
      );
    }

    // Get the original file information
    const originalFile = await prisma.uploadedFile.findUnique({
      where: { id: originalFileId }
    });

    if (!originalFile) {
      return NextResponse.json(
        { error: 'Original file not found' },
        { status: 404 }
      );
    }

    // Get the latest version number for this file
    let latestVersion;
    try {
      latestVersion = await prisma.resumeVersion.findFirst({
        where: { originalFileId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (columnError: any) {
      // If the originalFileId column doesn't exist, start with version 1
      if (columnError.code === 'P2022') {
        console.log('originalFileId column does not exist yet, starting with version 1');
        latestVersion = null;
      } else {
        throw columnError;
      }
    }

    // Extract version number from latest version or start with 1
    let nextVersionNumber = 1;
    if (latestVersion && latestVersion.versionName) {
      // Try to extract version number from various formats
      const versionMatch = latestVersion.versionName.match(/v(\d+)/);
      if (versionMatch) {
        nextVersionNumber = parseInt(versionMatch[1]) + 1;
      } else {
        // If no version number found, increment based on count of versions
        const versionCount = await prisma.resumeVersion.count({
          where: { originalFileId }
        });
        nextVersionNumber = versionCount + 1;
      }
    }

    // Create standardized filename with user-specific folder structure using utility functions
    const userId = session.user.id;
    const userName = session.user.name || session.user.email?.split('@')[0] || 'user';
    const cleanUserName = createSafeFileName(userName);
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5); // Add timestamp for uniqueness
    const versionsFolder = getUserVersionsFolder(userId);
    const blobPath = `${versionsFolder}${today}_v${nextVersionNumber}_${cleanUserName}_resume_${timestamp}.docx`;

    // Convert the resume content to DOCX format
    const docxBuffer = await textToDocx(resumeContent);

    // Upload to blob store as proper DOCX file in user-specific folder
    const blob = await put(blobPath, docxBuffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      allowOverwrite: true, // Allow overwriting to handle any duplicate filenames
    });

    // Create a descriptive version name
    const descriptiveVersionName = `${versionName} (v${nextVersionNumber})`;

    // Save version information to database
    await saveResumeVersion(
      session.user.id,
      descriptiveVersionName,
      resumeContent,
      originalFileId,
      blob.url,
      docxBuffer.length,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      appliedSuggestions
    );

    // Update the original file to point to the latest version
    await prisma.uploadedFile.update({
      where: { id: originalFileId },
      data: {
        blobUrl: blob.url,
        processingStatus: 'completed',
        isProcessed: true
      }
    });

    return NextResponse.json({
      success: true,
      version: {
        versionName: descriptiveVersionName,
        blobUrl: blob.url,
        createdAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error saving resume version:', error);
    return NextResponse.json(
      { error: 'Failed to save resume version' },
      { status: 500 }
    );
  }
}
