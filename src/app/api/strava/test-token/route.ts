import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

// GET /api/strava/test-token
// Test endpoint to check if the current token is valid
export async function GET() {
  try {
    const testAccessToken = process.env.STRAVA_TEST_ACCESS_TOKEN;
    
    if (!testAccessToken) {
      return NextResponse.json(
        { 
          error: 'No test access token configured',
          message: 'Please add STRAVA_TEST_ACCESS_TOKEN to environment variables'
        },
        { status: 400 }
      );
    }

    const stravaAPI = new StravaAPI();
    
    // Test the token by trying to get athlete info
    try {
      const athlete = await stravaAPI.getAthlete(testAccessToken) as {
        id: number;
        firstname: string;
        lastname: string;
        username?: string;
      };
      
      return NextResponse.json({
        success: true,
        message: 'Token is valid',
        athlete: {
          id: athlete.id,
          firstname: athlete.firstname,
          lastname: athlete.lastname,
          username: athlete.username
        },
        tokenPreview: `${testAccessToken.substring(0, 10)}...${testAccessToken.substring(testAccessToken.length - 10)}`
      });
      
    } catch (tokenError) {
      return NextResponse.json({
        success: false,
        error: 'Token is invalid or expired',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown error',
        tokenPreview: `${testAccessToken.substring(0, 10)}...${testAccessToken.substring(testAccessToken.length - 10)}`,
        message: 'You need to get a fresh access token from Strava. Visit: https://www.strava.com/settings/api'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Token test error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to test token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
