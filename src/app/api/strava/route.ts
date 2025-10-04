import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🚀 Strava OAuth initiation started');
    
    const clientId = process.env.STRAVA_CLIENT_ID;
    const redirectUri = process.env.STRAVA_REDIRECT_URI;
    
    console.log('🔧 Environment check:', { 
      clientId: clientId ? 'present' : 'missing', 
      redirectUri: redirectUri ? 'present' : 'missing' 
    });
    
    if (!clientId) {
      console.error('❌ STRAVA_CLIENT_ID not configured');
      return NextResponse.json({ error: 'Strava client ID not configured' }, { status: 500 });
    }
    
    if (!redirectUri) {
      console.error('❌ STRAVA_REDIRECT_URI not configured');
      return NextResponse.json({ error: 'Strava redirect URI not configured' }, { status: 500 });
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: 'read,activity:read,activity:read_all',
      approval_prompt: 'auto',
    });
    
    const authUrl = 'https://www.strava.com/oauth/authorize?' + params.toString();
    console.log('🔗 Redirecting to Strava:', authUrl);
    
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('💥 OAuth initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate OAuth' }, { status: 500 });
  }
}