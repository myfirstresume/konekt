import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all subscriptions for this user
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: userId },
      include: {
        user: {
          include: {
            usage: true
          }
        }
      }
    });

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        usage: true
      }
    });

    return NextResponse.json({
      user: user,
      subscriptions: subscriptions,
      subscriptionCount: subscriptions.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error in test subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
