import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getUserResumeFolder, createTimestampedFileName } from '@/utils/blob-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Please upload files smaller than 10MB.' },
        { status: 400 }
      );
    }

    // Create user-specific folder structure using utility functions
    const userId = session.user.id;
    const resumeFolder = getUserResumeFolder(userId);
    const timestampedFileName = createTimestampedFileName(file.name);
    const blobPath = `${resumeFolder}${timestampedFileName}`;

    const blob = await put(blobPath, file, {
      access: 'public',
    });

    // Store file information in database
    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        userId: session.user.id,
        filename: file.name,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        blobUrl: blob.url,
        processingStatus: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      fileId: uploadedFile.id
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
