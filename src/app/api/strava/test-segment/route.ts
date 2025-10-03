import { NextResponse } from 'next/server';
import { StravaAPI } from '@/lib/strava/api';

export async function GET() {
  try {
    // For testing, we'll use a hardcoded access token
    // In production, this would come from the database after OAuth
    const testAccessToken = process.env.STRAVA_TEST_ACCESS_TOKEN;
    
    if (!testAccessToken) {
      return NextResponse.json(
        { error: 'No test access token configured. Please add STRAVA_TEST_ACCESS_TOKEN to your environment variables.' },
        { status: 400 }
      );
    }

    const stravaAPI = new StravaAPI();
    const segmentId = 7977451; // The segment you specified
    
    // Get segment efforts for this segment
    const efforts = await stravaAPI.getSegmentEfforts(segmentId, testAccessToken);
    
    // Get athlete info
    const athlete = await stravaAPI.getAthlete(testAccessToken);
    
    return NextResponse.json({
      success: true,
      segmentId,
      athlete: {
        id: athlete.id,
        firstname: athlete.firstname,
        lastname: athlete.lastname,
        username: athlete.username
      },
      efforts: efforts.map(effort => ({
        id: effort.id,
        elapsedTime: effort.elapsedTime,
        startDate: effort.startDate,
        prRank: effort.prRank
      })),
      totalEfforts: efforts.length
    });
    
  } catch (error) {
    console.error('Test segment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch segment data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
