import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

type StravaAthlete = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
    }

    const stravaAPI = new StravaAPI();
    const stravaRedirectUri = process.env.NEXT_PUBLIC_APP_URL!;

    // Exchange code for tokens
    const tokenData = await stravaAPI.exchangeCodeForToken(code, stravaRedirectUri);
    
    // Get athlete information
    const athlete = await stravaAPI.getAthlete(tokenData.accessToken) as StravaAthlete;
    
    // Mock participant for now (until Supabase is set up)
    const participant = {
      id: `mock_${athlete.id}`,
      stravaId: athlete.id,
      firstName: athlete.firstname,
      lastName: athlete.lastname,
      email: athlete.email || '',
      stravaAccessToken: tokenData.accessToken,
      stravaRefreshToken: tokenData.refreshToken,
      tokenExpiresAt: tokenData.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Return participant data for client-side redirect
    return NextResponse.json({
      success: true,
      participantId: participant.id,
      state: state
    });

  } catch (error) {
    console.error('Strava callback error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
