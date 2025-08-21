import { NextRequest, NextResponse } from 'next/server';
import { getSampleResumeText } from '@/utils/parse-docx';

export async function GET(request: NextRequest) {
  try {
    const resumeText = await getSampleResumeText();
    
    return NextResponse.json({ 
      text: resumeText,
      success: true 
    });
  } catch (error) {
    console.error('Error getting sample resume:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load sample resume',
        success: false 
      },
      { status: 500 }
    );
  }
}
