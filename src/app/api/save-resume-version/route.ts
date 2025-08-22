import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { saveResumeVersion } from '@/utils/resume-cache';
import { textToDocx } from '@/utils/document-generator';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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
    const latestVersion = await prisma.resumeVersion.findFirst({
      where: { originalFileId },
      orderBy: { createdAt: 'desc' }
    });

    // Extract version number from latest version or start with 1
    let nextVersionNumber = 1;
    if (latestVersion && latestVersion.versionName) {
      const versionMatch = latestVersion.versionName.match(/v(\d+)/);
      if (versionMatch) {
        nextVersionNumber = parseInt(versionMatch[1]) + 1;
      }
    }

    // Create standardized filename
    const userName = session.user.name || session.user.email?.split('@')[0] || 'user';
    const cleanUserName = userName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    const versionFileName = `${cleanUserName}_resume_${today}_v${nextVersionNumber}.docx`;

    // Convert the resume content to DOCX format
    const docxBuffer = await textToDocx(resumeContent);

    // Upload to blob store as proper DOCX file
    const blob = await put(versionFileName, docxBuffer, {
      access: 'public',
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
