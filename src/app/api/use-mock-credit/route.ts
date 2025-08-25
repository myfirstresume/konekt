import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import type { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current usage data
    const currentUsage = await prisma.subscriptionUsage.findUnique({
      where: { userId: session.user.id }
    });

    if (!currentUsage) {
      return NextResponse.json({ 
        error: 'No subscription found. Please upgrade your plan to access mock interviews.',
        limitReached: true
      }, { status: 403 });
    }

    // Check if user has reached their mock interview limit
    if (currentUsage.liveMocksUsed >= currentUsage.liveMocksLimit) {
      return NextResponse.json({ 
        error: 'You have reached your monthly mock interview limit. Please upgrade your plan to continue.',
        limitReached: true
      }, { status: 429 });
    }

    // Increment the mock interview usage
    const updatedUsage = await prisma.subscriptionUsage.update({
      where: { userId: session.user.id },
      data: {
        liveMocksUsed: {
          increment: 1
        }
      }
    });

    console.log(`Updated mock interview count: ${updatedUsage.liveMocksUsed}/${updatedUsage.liveMocksLimit}`);

    return NextResponse.json({
      success: true,
      remainingMocks: updatedUsage.liveMocksLimit - updatedUsage.liveMocksUsed,
      totalMocks: updatedUsage.liveMocksLimit,
      usedMocks: updatedUsage.liveMocksUsed
    });

  } catch (error) {
    console.error('Error in use-mock-credit API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
