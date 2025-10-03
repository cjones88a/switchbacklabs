import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUri = searchParams.get('redirect_uri') || `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/auth`;
    const state = searchParams.get('state') || 'race_tracker';

    const stravaAPI = new StravaAPI();
    const authUrl = await stravaAPI.getAuthURL(redirectUri, state);

    return NextResponse.json({ authUrl });
    
  } catch (error) {
    console.error('Strava initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Strava authentication' }, 
      { status: 500 }
    );
  }
}
