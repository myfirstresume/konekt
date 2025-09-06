import { NextRequest, NextResponse } from 'next/server';
import { getReferralStats, getUserByReferralId } from '@/utils/waitlist';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const referralId = searchParams.get('id');
    
    if (!referralId) {
      return NextResponse.json({ error: 'Referral ID is required' }, { status: 400 });
    }

    // Get referral stats
    const stats = await getReferralStats(referralId);
    
    if (!stats) {
      return NextResponse.json({ error: 'Referral ID not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      referralId,
      stats
    });

  } catch (error: unknown) {
    console.error('Referral stats error:', error);
    
    let message = 'Server error';
    const status = 500;
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { referralId, action } = await req.json();
    
    if (!referralId || typeof referralId !== 'string') {
      return NextResponse.json({ error: 'Invalid referral ID' }, { status: 400 });
    }

    if (action === 'lookup') {
      // Just lookup user data without tracking
      const userData = await getUserByReferralId(referralId);
      
      if (!userData) {
        return NextResponse.json({ error: 'Referral ID not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        userData
      });
    }

    if (action === 'stats') {
      // Get referral stats
      const stats = await getReferralStats(referralId);
      
      if (!stats) {
        return NextResponse.json({ error: 'Referral ID not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        referralId,
        stats
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: unknown) {
    console.error('Referral API error:', error);
    
    let message = 'Server error';
    const status = 500;
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
      message = (error as { message: string }).message;
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}
