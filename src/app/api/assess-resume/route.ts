import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import OpenAI from 'openai';
import instructions from '@/prompts/instructions';
import { 
  generateResumeHash, 
  getCachedResumeReview, 
  saveResumeReviewToCache,
  CachedComment 
} from '@/utils/resume-cache';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resume } = await request.json();
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume content is required' }, { status: 400 });
    }

    // Generate hash of resume content for caching
    const resumeHash = generateResumeHash(resume);
    console.log(`Generated resume hash: ${resumeHash.substring(0, 8)}...`);

    // Check for cached review first
    const cachedComments = await getCachedResumeReview(session.user.id, resumeHash);
    
    if (cachedComments) {
      console.log(`Returning cached review with ${cachedComments.length} comments`);
      return NextResponse.json({ 
        comments: cachedComments,
        cached: true 
      });
    }

    // Check usage limits before generating new review
    const currentUsage = await prisma.subscriptionUsage.findUnique({
      where: { userId: session.user.id }
    });

    if (currentUsage && currentUsage.resumeReviewsUsed >= currentUsage.resumeReviewsLimit) {
      return NextResponse.json({ 
        error: 'Monthly review limit reached. Please upgrade your plan to continue.',
        limitReached: true
      }, { status: 429 });
    }

    // Increment review count when generating new review
    try {
      await prisma.subscriptionUsage.upsert({
        where: { userId: session.user.id },
        update: {
          resumeReviewsUsed: {
            increment: 1
          }
        },
        create: {
          userId: session.user.id,
          resumeReviewsUsed: 1,
          resumeReviewsLimit: 5, // Default limit
          followUpQuestionsUsed: 0,
          followUpQuestionsLimit: 200,
          voiceNotesUsed: 0,
          voiceNotesLimit: 15,
          liveMocksUsed: 0,
          liveMocksLimit: 1,
          usageResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // First day of next month
        }
      });
    } catch (error) {
      console.error('Error updating review count:', error);
      // Continue with review generation even if tracking fails
    }

    console.log(`No cache found, calling OpenAI...`);

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: instructions,
        },
        {
          role: 'user',
          content: `Please review this resume:\n\n${resume}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw OpenAI response:', content.substring(0, 200) + '...');

    // Clean and parse the JSON response
    let cleanContent = content.trim();

    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '');
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.replace(/\s*```$/, '');
    }

    // Clean up common JSON formatting issues
    cleanContent = cleanContent
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single spaces
      .trim();

    // Try to fix unterminated strings by finding the last complete object
    if (cleanContent.includes('"reference_text":') && !cleanContent.endsWith(']')) {
      console.log('⚠️  Detected unterminated JSON, attempting to fix...');
      const lastCompleteBrace = cleanContent.lastIndexOf('}');
      if (lastCompleteBrace > 0) {
        let objectStart = lastCompleteBrace;
        let braceCount = 0;
        for (let i = lastCompleteBrace; i >= 0; i--) {
          if (cleanContent[i] === '}') braceCount++;
          if (cleanContent[i] === '{') braceCount--;
          if (braceCount === 0) {
            objectStart = i;
            break;
          }
        }
        cleanContent = cleanContent.substring(0, lastCompleteBrace + 1) + ']';
        console.log('✅ Fixed unterminated JSON by truncating to last complete object');
      }
    }

    let comments: CachedComment[] = [];
    
    try {
      comments = JSON.parse(cleanContent);
      console.log(`Successfully parsed ${comments.length} comments from OpenAI response`);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Cleaned content:', cleanContent);
      throw new Error('Failed to parse OpenAI response');
    }

    // Validate comments structure
    if (!Array.isArray(comments)) {
      throw new Error('OpenAI response is not an array');
    }

    // Save to cache
    await saveResumeReviewToCache(session.user.id, resumeHash, comments);

    console.log(`Saved ${comments.length} comments to cache`);

    return NextResponse.json({ 
      comments,
      cached: false 
    });

  } catch (error) {
    console.error('Error in assess-resume API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
