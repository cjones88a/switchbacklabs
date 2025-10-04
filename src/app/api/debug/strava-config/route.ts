import { NextResponse } from 'next/server';

// GET /api/debug/strava-config
// Debug endpoint to check Strava configuration
export async function GET() {
  try {
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    const redirectUri = process.env.STRAVA_REDIRECT_URI;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    const config = {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 8)}...` : 'MISSING',
      redirectUri: redirectUri || 'MISSING',
      appUrl: appUrl || 'MISSING',
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri,
      hasAppUrl: !!appUrl
    };
    
    console.log('🔍 Strava config debug:', config);
    
    return NextResponse.json({
      status: 'ok',
      config,
      message: 'Strava configuration check complete'
    });
    
  } catch (error) {
    console.error('❌ Debug config error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to check Strava configuration'
    }, { status: 500 });
  }
}
