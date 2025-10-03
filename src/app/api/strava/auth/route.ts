import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';
import { DatabaseService } from '@/lib/database/supabase';

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

    if (error) {
      return NextResponse.json({ error: 'Strava authorization failed' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 });
    }

    const stravaAPI = new StravaAPI();
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/auth`;
    
    // Exchange code for tokens
    const tokenData = await stravaAPI.exchangeCodeForToken(code, redirectUri);
    
    // Get athlete information
    const athlete = await stravaAPI.getAthlete(tokenData.accessToken) as StravaAthlete;
    
    // Check if participant already exists
    let participant = await DatabaseService.getParticipantByStravaId(athlete.id);
    
    if (participant) {
      // Update existing participant's tokens
      participant = await DatabaseService.updateParticipantTokens(
        athlete.id,
        tokenData.accessToken,
        tokenData.refreshToken,
        tokenData.expiresAt
      );
    } else {
      // Create new participant
      participant = await DatabaseService.createParticipant({
        stravaId: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        email: athlete.email || '',
        stravaAccessToken: tokenData.accessToken,
        stravaRefreshToken: tokenData.refreshToken,
        tokenExpiresAt: tokenData.expiresAt
      });
    }

    // Redirect to test page for now
    const redirectUrl = new URL('/strava-test', process.env.NEXT_PUBLIC_APP_URL!);
    redirectUrl.searchParams.set('success', 'true');
    redirectUrl.searchParams.set('participantId', participant.id);
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Strava auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Strava' }, 
      { status: 500 }
    );
  }
}
