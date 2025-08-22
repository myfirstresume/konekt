import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mammoth from 'mammoth';

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

    const { blobUrl, fileType } = await request.json();

    if (!blobUrl) {
      return NextResponse.json(
        { error: 'Blob URL is required' },
        { status: 400 }
      );
    }

    // Fetch the file from the blob URL
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file from blob URL');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';

    // Parse based on file type
    if (fileType.includes('docx') || fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      try {
        // Try to parse as DOCX using mammoth
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        
        if (result.messages.length > 0) {
          console.warn('Mammoth parsing warnings:', result.messages);
        }
      } catch (mammothError) {
        console.warn('Failed to parse as DOCX, trying as text:', mammothError);
        // Fallback to text parsing if mammoth fails
        text = buffer.toString('utf-8');
      }
    } else if (fileType.includes('doc') || fileType.includes('application/msword')) {
      // For .doc files, we'll need a different parser
      // For now, return an error suggesting to convert to DOCX
      return NextResponse.json(
        { error: 'DOC files are not supported. Please convert your file to DOCX format.' },
        { status: 400 }
      );
    } else if (fileType.includes('pdf')) {
      // For PDF files, we'll need a PDF parser
      // For now, return an error
      return NextResponse.json(
        { error: 'PDF parsing is not yet implemented. Please convert your file to DOCX format.' },
        { status: 400 }
      );
    } else if (fileType.includes('text') || fileType.includes('txt')) {
      // For text files, just convert buffer to string
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json(
        { error: `Unsupported file type: ${fileType}. Please upload a DOCX, TXT, or PDF file.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: text,
      fileType: fileType
    });

  } catch (error) {
    console.error('Error parsing resume blob:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume file' },
      { status: 500 }
    );
  }
}
