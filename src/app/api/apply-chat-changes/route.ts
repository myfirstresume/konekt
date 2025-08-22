import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resume, chatMessages, comments, selectedCommentId } = await request.json();
    
    if (!resume || !chatMessages || !Array.isArray(chatMessages)) {
      return NextResponse.json({ error: 'Resume content and chat messages are required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build context from the chat conversation
    const chatContext = chatMessages
      .filter((msg: { role: string }) => msg.role === 'user')
      .map((msg: { content: string }) => `User: ${msg.content}`)
      .join('\n');

    // Build context from comments
    const commentsContext = comments.map((comment: { id: string; text: string; why: string; category: string; reference_text: string }) => 
      `Comment ${comment.id}: ${comment.text}\nReason: ${comment.why}\nCategory: ${comment.category}${comment.reference_text ? `\nReference: "${comment.reference_text}"` : ''}`
    ).join('\n\n');

    // Create a prompt for applying changes based on chat
    // TODO: Move the prompts to the prompt folder
    const applyChangesPrompt = `
You are a professional resume editor. The user has been chatting with an AI about improving their resume and has provided additional context and information.

ORIGINAL RESUME:
${resume}

RESUME SUGGESTIONS:
${commentsContext}

CHAT CONVERSATION:
${chatContext}

${selectedCommentId ? `The user was specifically discussing comment ${selectedCommentId}.` : ''}

INSTRUCTIONS:
- Apply the improvements discussed in the chat conversation to the resume
- Use the additional context and information provided by the user
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
          content: 'You are a professional resume editor. Apply the improvements discussed in the chat conversation to the resume and return the complete updated version.',
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
      updatedResume: cleanResume
    });

  } catch (error) {
    console.error('Error in apply-chat-changes API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
