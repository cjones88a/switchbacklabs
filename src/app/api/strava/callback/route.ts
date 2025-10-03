import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

type StravaAthlete = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      return NextResponse.redirect(new URL('/strava-test?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL!));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/strava-test?error=no_code', process.env.NEXT_PUBLIC_APP_URL!));
    }

    const stravaAPI = new StravaAPI();
    const redirectUri = process.env.NEXT_PUBLIC_APP_URL!;

    // Exchange code for tokens
    const tokenData = await stravaAPI.exchangeCodeForToken(code, redirectUri);
    
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

    // Redirect based on state
    if (state === 'race_tracker') {
      const redirectUrl = new URL('/race-tracker', process.env.NEXT_PUBLIC_APP_URL!);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('participantId', participant.id);
      return NextResponse.redirect(redirectUrl);
    } else {
      // Default to strava-test
      const redirectUrl = new URL('/strava-test', process.env.NEXT_PUBLIC_APP_URL!);
      redirectUrl.searchParams.set('success', 'true');
      redirectUrl.searchParams.set('participantId', participant.id);
      return NextResponse.redirect(redirectUrl);
    }

  } catch (error) {
    console.error('Strava callback error:', error);
    return NextResponse.redirect(new URL('/strava-test?error=callback_failed', process.env.NEXT_PUBLIC_APP_URL!));
  }
}
