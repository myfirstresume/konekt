import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resume, suggestions } = await request.json();
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }

    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return NextResponse.json({ error: 'At least one suggestion is required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create a prompt for applying the changes
    const suggestionsText = suggestions.map((suggestion: any, index: number) => 
      `${index + 1}. ${suggestion.text}: ${suggestion.why}`
    ).join('\n');

    const applyChangesPrompt = `
You are a professional resume editor. Please apply the following suggestions to the resume below. Make the changes inline and return the complete updated resume.

SUGGESTIONS TO APPLY:
${suggestionsText}

ORIGINAL RESUME:
${resume}

INSTRUCTIONS:
- Apply all the suggestions provided above
- Maintain the original formatting and structure
- Make the changes inline within the existing text
- Return the complete updated resume
- Do not add any explanations or markdown formatting
- Return only the plain text of the updated resume

UPDATED RESUME:
`;

    // Call OpenAI API to apply changes
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume editor. Apply the given suggestions to the resume and return the complete updated version.',
        },
        {
          role: 'user',
          content: applyChangesPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const updatedResume = completion.choices[0]?.message?.content;
    
    if (!updatedResume) {
      throw new Error('No response from OpenAI');
    }

    // Clean up the response (remove any markdown formatting if present)
    let cleanResume = updatedResume.trim();
    
    // Remove markdown code blocks if present
    if (cleanResume.startsWith('```')) {
      cleanResume = cleanResume.replace(/^```\w*\s*/, '');
    }
    if (cleanResume.endsWith('```')) {
      cleanResume = cleanResume.replace(/\s*```$/, '');
    }

    return NextResponse.json({ 
      updatedResume: cleanResume,
      appliedSuggestions: suggestions.length
    });

  } catch (error) {
    console.error('Error in apply-changes API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
