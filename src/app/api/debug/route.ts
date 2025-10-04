import { NextResponse } from 'next/server';

// GET /api/debug
// Debug endpoint to check environment variables and system status
export async function GET() {
  try {
    const envCheck = {
      STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID ? 'present' : 'missing',
      STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET ? 'present' : 'missing',
      STRAVA_REDIRECT_URI: process.env.STRAVA_REDIRECT_URI ? 'present' : 'missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      VERCEL_URL: process.env.VERCEL_URL || 'not set'
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://switchbacklabsco.com';
    const redirectUri = `${baseUrl}/api/strava/callback-simple`;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      oauth: {
        baseUrl,
        redirectUri,
        authUrl: process.env.STRAVA_CLIENT_ID 
          ? `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read,activity:read,activity:read_all&approval_prompt=auto&state=race_tracker`
          : 'Cannot generate - missing STRAVA_CLIENT_ID'
      },
      status: 'OK'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
