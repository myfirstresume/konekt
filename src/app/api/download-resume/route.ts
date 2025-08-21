import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getLatestResumeVersion } from '@/utils/resume-cache';
import { generateDocx, generatePdf, DOCUMENT_FORMATS } from '@/utils/document-generator';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get format from query parameters (default to docx)
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'docx';
    
    if (!DOCUMENT_FORMATS[format]) {
      return NextResponse.json({ error: 'Invalid format. Use "docx" or "pdf"' }, { status: 400 });
    }

    const documentFormat = DOCUMENT_FORMATS[format];

    // Try to get the latest resume version from database
    const latestVersion = await getLatestResumeVersion(session.user.id);
    
    if (latestVersion) {
      // Generate document in the requested format
      let documentBuffer: Buffer;
      
      if (format === 'docx') {
        documentBuffer = await generateDocx(latestVersion.resumeContent);
      } else if (format === 'pdf') {
        documentBuffer = await generatePdf(latestVersion.resumeContent);
      } else {
        throw new Error('Unsupported format');
      }
      
      // Return the generated document
      return new NextResponse(documentBuffer, {
        headers: {
          'Content-Type': documentFormat.mimeType,
          'Content-Disposition': `attachment; filename="resume.${documentFormat.extension}"`,
          'Content-Length': documentBuffer.length.toString(),
        },
      });
    }

    // Fallback to original DOCX file if no version exists
    const resumePath = join(process.cwd(), 'public', 'data', 'sample_resume.docx');
    
    try {
      // Read the file
      const fileBuffer = readFileSync(resumePath);
      
      // Create response with appropriate headers for file download
      const response = new NextResponse(fileBuffer);
      
      // Set headers for file download
      response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      response.headers.set('Content-Disposition', 'attachment; filename="resume.docx"');
      response.headers.set('Content-Length', fileBuffer.length.toString());
      
      return response;
    } catch (fileError) {
      console.error('Error reading resume file:', fileError);
      return NextResponse.json({ error: 'Resume file not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error in download-resume API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
