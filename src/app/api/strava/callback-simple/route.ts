import { NextRequest, NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/callback-simple
// Simplified callback that handles the OAuth response and redirects with token
export async function GET(request: NextRequest) {
  try {
    console.log('🔗 Simple Strava callback received:', request.url);
    
    // Check environment variables first
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing Strava environment variables:', {
        clientId: clientId ? 'present' : 'missing',
        clientSecret: clientSecret ? 'present' : 'missing'
      });
      return NextResponse.redirect('/race-tracker?error=config_missing');
    }
    
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    console.log('📋 Callback params:', { 
      code: code ? 'present' : 'missing', 
      state, 
      error 
    });
    
    if (error) {
      console.error('❌ Strava OAuth error:', error);
      return NextResponse.redirect('/race-tracker?error=' + encodeURIComponent(error));
    }
    
    if (!code) {
      console.error('❌ Missing authorization code');
      return NextResponse.redirect('/race-tracker?error=missing_code');
    }
    
    // Exchange code for tokens
    console.log('🔄 Exchanging code for tokens...');
    const stravaAPI = new StravaAPI();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://switchbacklabsco.com';
    const redirectUri = process.env.STRAVA_REDIRECT_URI || `${baseUrl}/api/strava/callback-simple`;
    
    console.log('🔧 Environment check:', {
      baseUrl,
      redirectUri,
      clientId: clientId ? 'present' : 'missing',
      clientSecret: clientSecret ? 'present' : 'missing'
    });
    
    const tokenData = await stravaAPI.exchangeCodeForToken(code, redirectUri);
    console.log('✅ Token exchange successful');
    
    // Get athlete info
    console.log('🔄 Fetching athlete info...');
    const athlete = await stravaAPI.getAthlete(tokenData.accessToken) as {
      id: number;
      firstname: string;
      lastname: string;
      username?: string;
    };
    console.log('✅ Athlete info retrieved:', athlete.firstname, athlete.lastname);
    
    // Redirect to race tracker with access token
    const redirectUrl = new URL('/race-tracker', baseUrl);
    redirectUrl.searchParams.set('success', '1');
    redirectUrl.searchParams.set('accessToken', tokenData.accessToken);
    redirectUrl.searchParams.set('athleteId', athlete.id.toString());
    redirectUrl.searchParams.set('athleteName', `${athlete.firstname} ${athlete.lastname}`);
    
    console.log('✅ Redirecting to race tracker with token');
    return NextResponse.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('💥 Simple callback error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.redirect('/race-tracker?error=callback_failed&details=' + encodeURIComponent(error instanceof Error ? error.message : 'Unknown error'));
  }
}
