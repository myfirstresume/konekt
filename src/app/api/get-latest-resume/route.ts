import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { getLatestResumeVersion } from '@/utils/resume-cache';
import { readFileSync } from 'fs';
import { join } from 'path';
import mammoth from 'mammoth';
import type { Session } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get originalFileId from query parameters
    const { searchParams } = new URL(request.url);
    const originalFileId = searchParams.get('fileId');

    if (!originalFileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Try to get the latest resume version from database
    const latestVersion = await getLatestResumeVersion(session.user.id, originalFileId);
    
    if (latestVersion) {
      // Return the latest version from database
      return NextResponse.json({ 
        text: latestVersion.resumeContent,
        version: latestVersion.versionName,
        isLatest: true
      });
    }

    // Fallback to original sample resume if no version exists
    const resumePath = join(process.cwd(), 'public', 'data', 'sample_resume.docx');
    
    try {
      // Read the file
      const fileBuffer = readFileSync(resumePath);
      
      // Convert DOCX to text
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      const text = result.value;
      
      return NextResponse.json({ 
        text: text,
        version: 'original',
        isLatest: false
      });
      
    } catch (fileError) {
      console.error('Error reading resume file:', fileError);
      return NextResponse.json({ error: 'Resume file not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in get-latest-resume API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
