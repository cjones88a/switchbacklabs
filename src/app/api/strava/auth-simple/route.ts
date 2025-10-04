import { NextResponse } from 'next/server';

// GET /api/strava/auth-simple
// Simplified OAuth initiation that handles environment variables gracefully
export async function GET() {
  try {
    console.log('🚀 Simple Strava OAuth initiation');
    
    const clientId = process.env.STRAVA_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://switchbacklabsco.com';
    const redirectUri = `${baseUrl}/api/strava/callback-simple`;
    
    console.log('🔧 Environment check:', { 
      clientId: clientId ? 'present' : 'missing',
      baseUrl,
      redirectUri
    });
    
    if (!clientId) {
      console.error('❌ STRAVA_CLIENT_ID not configured');
      return NextResponse.json({ 
        error: 'Strava client ID not configured',
        message: 'Please add STRAVA_CLIENT_ID to environment variables'
      }, { status: 500 });
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'read,activity:read,activity:read_all',
      approval_prompt: 'auto',
      state: 'race_tracker'
    });
    
    const authUrl = 'https://www.strava.com/oauth/authorize?' + params.toString();
    console.log('🔗 Redirecting to Strava:', authUrl);
    
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('💥 Simple OAuth initiation error:', error);
    return NextResponse.json({ 
      error: 'Failed to initiate OAuth',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
