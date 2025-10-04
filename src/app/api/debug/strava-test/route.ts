import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/debug/strava-test
// Test endpoint to check if Strava API is working
export async function GET() {
  try {
    console.log('🧪 Testing Strava API...');
    
    // Check environment variables
    const clientId = process.env.STRAVA_CLIENT_ID;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing Strava environment variables',
        details: {
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret
        }
      }, { status: 500 });
    }
    
    // Test Strava API initialization
    const stravaAPI = new StravaAPI();
    console.log('✅ Strava API initialized');
    
    // Test auth URL generation
    const authUrl = await stravaAPI.getAuthURL('https://switchbacklabsco.com/api/strava/callback-simple');
    console.log('✅ Auth URL generated');
    
    return NextResponse.json({
      status: 'ok',
      message: 'Strava API test successful',
      details: {
        authUrlGenerated: !!authUrl,
        authUrl: authUrl.substring(0, 100) + '...'
      }
    });
    
  } catch (error) {
    console.error('❌ Strava API test error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Strava API test failed'
    }, { status: 500 });
  }
}
