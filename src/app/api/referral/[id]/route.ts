import { NextRequest, NextResponse } from 'next/server';
import { trackReferralVisit, getUserByReferralId } from '@/utils/waitlist';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid referral ID' }, { status: 400 });
    }

    // Track the referral visit
    const result = await trackReferralVisit(id);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Referral ID not found' }, { status: 404 });
    }

    // Return success response with user data
    return NextResponse.json({
      success: true,
      message: 'Referral visit tracked successfully',
      userData: result.userData
    });

  } catch (error: unknown) {
    console.error('Referral tracking error:', error);
    
    let message = 'Server error';
    const status = 500;
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid referral ID' }, { status: 400 });
    }

    // Get user data without tracking (for checking if referral exists)
    const userData = await getUserByReferralId(id);
    
    if (!userData) {
      return NextResponse.json({ error: 'Referral ID not found' }, { status: 404 });
    }

    // Return user data without tracking
    return NextResponse.json({
      success: true,
      userData: userData
    });

  } catch (error: unknown) {
    console.error('Referral lookup error:', error);
    
    let message = 'Server error';
    const status = 500;
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}
