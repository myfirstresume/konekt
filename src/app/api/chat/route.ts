import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, resumeText, comments, relatedCommentId } = await request.json();
    
    if (!message || !resumeText) {
      return NextResponse.json({ error: 'Message and resume text are required' }, { status: 400 });
    }

    // Check user's follow-up question limit
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { subscription: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get usage data
    const usageResponse = await fetch(`${request.nextUrl.origin}/api/usage`, {
      headers: { 'Cookie': request.headers.get('cookie') || '' }
    });
    
    if (!usageResponse.ok) {
      return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
    }
    
    const usage = await usageResponse.json();
    
    if (usage.followUpQuestionsUsed >= usage.followUpQuestionsLimit) {
      return NextResponse.json({ 
        error: 'You have reached your monthly follow-up question limit. Please upgrade your plan to continue.',
        limitReached: true
      }, { status: 429 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build context from comments
    const commentsContext = comments.map((comment: { id: string; text: string; why: string; category: string; reference_text?: string }) => 
      `Comment ${comment.id}: ${comment.text}\nReason: ${comment.why}\nCategory: ${comment.category}${comment.reference_text ? `\nReference: "${comment.reference_text}"` : ''}`
    ).join('\n\n');

    // Create the prompt
    const systemPrompt = `You are a professional resume reviewer helping a user improve their resume. The user has provided their resume text and some AI-generated suggestions for improvement. 

Your role is to:
1. Answer follow-up questions about the resume suggestions
2. Help the user provide better context for their achievements
3. Suggest specific improvements based on the user's additional information
4. Be encouraging and constructive in your feedback

Current resume suggestions:
${commentsContext}

Resume text:
${resumeText}

${relatedCommentId ? `The user is specifically asking about comment ${relatedCommentId}. Please focus your response on that suggestion.` : ''}

Provide helpful, specific advice that will help the user improve their resume. Keep responses concise but informative.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantResponse = completion.choices[0]?.message?.content;
    
    if (!assistantResponse) {
      throw new Error('No response from OpenAI');
    }

    // Save the assistant's response to the database
    const assistantMessage = {
      role: 'assistant',
      content: assistantResponse,
      relatedCommentId: relatedCommentId || null
    };
    
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantMessage),
    });
    
    // Increment follow-up questions usage
    await prisma.subscriptionUsage.update({
      where: { userId: user.id },
      data: {
        followUpQuestionsUsed: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      response: assistantResponse,
      usage: {
        followUpQuestionsUsed: usage.followUpQuestionsUsed + 1,
        followUpQuestionsLimit: usage.followUpQuestionsLimit
      }
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
