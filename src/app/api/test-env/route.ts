import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    stripeKeys: {
      freshman: process.env.STRIPE_FRESHMAN_PRICE_ID || 'NOT_SET',
      sophomore: process.env.STRIPE_SOPHOMORE_PRICE_ID || 'NOT_SET',
      mocks: process.env.STRIPE_MOCKS_PRICE_ID || 'NOT_SET',
    },
    nextAuth: {
      url: process.env.NEXTAUTH_URL || 'NOT_SET',
      secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
    }
  });
}
