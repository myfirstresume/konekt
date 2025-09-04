import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist } from '@/utils/waitlist';

export async function POST(req: NextRequest) {
  try {
    const { email, referralId, mentor, company } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    const result = await addToWaitlist(email, referralId, mentor, company);
    return NextResponse.json({ 
      success: true, 
      referralLink: result.referralLink,
      id: result.id
    });
  } catch (error: unknown) {
    let message = 'Server error';
    let status = 500;
    
    if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      message = (error as { message: string }).message;
      
      // Handle specific error cases
      if (message === 'Email already registered') {
        status = 409; // Conflict status code
      }
    }
    
    return NextResponse.json({ error: message }, { status });
  }
} 