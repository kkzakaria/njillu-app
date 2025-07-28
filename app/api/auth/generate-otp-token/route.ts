import { NextRequest, NextResponse } from 'next/server';
import { generateOtpToken } from '@/lib/auth/flow-guard';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Générer le token de validation OTP
    const otpToken = generateOtpToken(email);
    
    return NextResponse.json({ otpToken });
  } catch (error) {
    console.error('Erreur génération token OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}